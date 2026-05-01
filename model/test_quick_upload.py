from app import app
from io import BytesIO
from PIL import Image

c=app.test_client()
# create tiny image
img=Image.new('RGB',(10,10),(255,0,0))
b=BytesIO()
img.save(b,'JPEG')
b.seek(0)
resp = c.post('/api/v1/upload-image', data={'image': (b,'test.jpg')}, content_type='multipart/form-data')
print('Status', resp.status_code)
print('JSON', resp.get_json())
