import asyncio
import os
import subprocess
import tempfile
from urllib.parse import urlparse
from pathlib import Path
import logging
import time

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes

# إعداد التسجيل
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# توكن البوت
TOKEN = '7769292194:AAGaoMtEYCPUU5GzqU4tijfrCLg44GXy9LU'

# تخزين حالة المستخدمين
user_states = {}

def is_valid_url(url):
    """التحقق من صحة الرابط"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def detect_platform(url):
    """اكتشاف المنصة من الرابط"""
    if 'youtube.com' in url or 'youtu.be' in url:
        return 'youtube'
    elif 'tiktok.com' in url or 'vm.tiktok.com' in url:
        return 'tiktok'
    elif 'instagram.com' in url:
        return 'instagram'
    else:
        return 'unknown'

def create_main_keyboard():
    """إنشاء لوحة المفاتيح الرئيسية"""
    keyboard = [
        [
            InlineKeyboardButton("⚡ تحميل سريع", callback_data='quick'),
            InlineKeyboardButton("📽️ جودة عالية", callback_data='high'),
            InlineKeyboardButton("🎵 صوت فقط", callback_data='audio')
        ],
        [
            InlineKeyboardButton("🔄 فيديو جديد", callback_data='new_video')
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def create_secondary_keyboard():
    """إنشاء لوحة المفاتيح الثانوية"""
    return create_main_keyboard()

async def download_with_ytdlp(url, quality, platform):
    """تحميل الفيديو باستخدام yt-dlp"""
    try:
        # إنشاء مجلد التحميل
        downloads_dir = Path(__file__).parent / 'downloads'
        downloads_dir.mkdir(exist_ok=True)
        
        # إنشاء اسم ملف مؤقت
        timestamp = int(time.time())
        
        if quality == 'audio':
            output_path = downloads_dir / f'audio_{timestamp}.mp3'
            command = [
                'yt-dlp', '-x', '--audio-format', 'mp3', 
                '--no-playlist', '-o', str(output_path), url
            ]
        else:
            output_path = downloads_dir / f'video_{timestamp}.mp4'
            
            if platform == 'tiktok':
                # حل بديل لإزالة العلامة المائية من تيك توك
                command = [
                    'yt-dlp', '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
                    '--no-playlist', '-o', str(output_path), url
                ]
            elif platform == 'instagram':
                command = [
                    'yt-dlp', '-f', 'best', '--no-playlist', '-o', str(output_path), url
                ]
            elif platform == 'youtube':
                if quality == 'quick':
                    command = [
                        'yt-dlp', '-f', 'worst', '--no-playlist', '-o', str(output_path), url
                    ]
                else:
                    command = [
                        'yt-dlp', '-f', 'best', '--no-playlist', '-o', str(output_path), url
                    ]
            else:
                raise Exception('المنصة غير مدعومة')
        
        # تنفيذ الأمر
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = stderr.decode('utf-8') if stderr else 'خطأ غير معروف'
            raise Exception(f'فشل تحميل الفيديو: {error_msg}')
        
        return {
            'path': str(output_path),
            'type': 'audio' if quality == 'audio' else 'video'
        }
        
    except Exception as e:
        raise Exception(f'خطأ في التحميل: {str(e)}')

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """معالج أمر /start"""
    message = """🎬 مرحباً في بوت تحميل الفيديوهات بدون علامة مائية

📱 أرسل رابط فيديو من YouTube، TikTok، أو Instagram

⚡ يمكنك تحميل الفيديو بجودة عالية أو صوت فقط

✨ الميزات:
- دعم تحميل الفيديوهات بدون علامة مائية (حسب توفرها)
- خيار تحميل الصوت فقط
- دعم عدة منصات"""
    
    await update.message.reply_text(message)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """معالج الرسائل النصية"""
    chat_id = update.effective_chat.id
    url = update.message.text
    
    if not is_valid_url(url):
        await update.message.reply_text('❌ يرجى إرسال رابط صحيح')
        return
    
    platform = detect_platform(url)
    if platform == 'unknown':
        await update.message.reply_text('❌ المنصة غير مدعومة. يرجى استخدام YouTube، TikTok أو Instagram')
        return
    
    # حفظ حالة المستخدم
    user_states[chat_id] = {'url': url, 'platform': platform}
    
    message = f'📱 تم اكتشاف فيديو من {platform.upper()}\nاختر طريقة التحميل:'
    await update.message.reply_text(message, reply_markup=create_main_keyboard())

async def handle_callback_query(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """معالج الضغط على الأزرار"""
    query = update.callback_query
    chat_id = query.message.chat.id
    message_id = query.message.message_id
    data = query.data
    
    # تأكيد استلام الضغطة
    await query.answer()
    
    if data == 'new_video':
        if chat_id in user_states:
            del user_states[chat_id]
        await query.edit_message_text('📱 أرسل رابط فيديو جديد')
        return
    
    # التحقق من وجود حالة المستخدم
    if chat_id not in user_states:
        await query.edit_message_text('❌ يرجى إرسال رابط جديد')
        return
    
    user_state = user_states[chat_id]
    url = user_state['url']
    platform = user_state['platform']
    quality = data  # quick أو high أو audio
    
    # إظهار رسالة التحميل
    await query.edit_message_text('⏳ جاري تحميل الملف...')
    
    try:
        # تحميل الملف
        result = await download_with_ytdlp(url, quality, platform)
        filepath = result['path']
        file_type = result['type']
        
        # إرسال الملف
        if file_type == 'audio':
            with open(filepath, 'rb') as audio_file:
                await context.bot.send_audio(
                    chat_id=chat_id,
                    audio=audio_file,
                    title='صوت الفيديو'
                )
        else:
            with open(filepath, 'rb') as video_file:
                await context.bot.send_video(
                    chat_id=chat_id,
                    video=video_file,
                    caption=f'🎬 فيديو من {platform.upper()}'
                )
        
        # حذف الملف بعد الإرسال
        os.remove(filepath)
        
        # إرسال رسالة النجاح
        await context.bot.send_message(
            chat_id=chat_id,
            text='✅ تم التحميل بنجاح!\nماذا تريد أن تفعل بعد ذلك؟',
            reply_markup=create_secondary_keyboard()
        )
        
    except Exception as error:
        await query.edit_message_text(f'❌ خطأ أثناء التحميل: {str(error)}')

def main():
    """الدالة الرئيسية لتشغيل البوت"""
    # إنشاء تطبيق البوت
    application = Application.builder().token(TOKEN).job_queue(None).build()
    
    # إضافة معالجات الأوامر والرسائل
    application.add_handler(CommandHandler('start', start_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    application.add_handler(CallbackQueryHandler(handle_callback_query))
    
    # تشغيل البوت
    print('🚀 البوت يعمل الآن...')
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()