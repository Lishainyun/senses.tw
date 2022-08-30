from pathlib import Path
from PIL import Image
import PIL, os

BASE_DIR = Path(__file__).resolve().parent.parent


allowed_extensions=['tiff','tif','bmp','jpg','jpeg','gif','png','eps']
allowed_images = {}
filename = []

def image_validator(images):

    for image in images:

        image_obj = image.file
        lowered_image_name = image.name.lower() 
        image_extension = lowered_image_name.split('.')[-1]

        if image_extension in allowed_extensions:
            allowed_images[f'{lowered_image_name}'] = image_obj

def set_image_storage_path(user_id, images):

    image_validator(images)
        
    if len(allowed_images) != 0:

        # save image obj into folder
        for name in allowed_images:

            try:  

                IMAGES_PATH = os.path.join(BASE_DIR, f'static/media_uploaded/images/story/user_{user_id}/{name}')
                img = Image.open(allowed_images[name])
                img.save(IMAGES_PATH)

                filename.append(name)

            except IOError as e: 
                print(e)
            finally:
                img.close()


    


    