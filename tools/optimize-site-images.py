"""Create display-size derivatives while preserving original artwork."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
output = ROOT / 'assets/optimized'
output.mkdir(exist_ok=True)
before = after = 0
for source in (ROOT / 'assets').glob('*.png'):
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    limit = 1280 if source.stem in ('hero', 'missing-pair', 'dorm-gear-banner-haavk', 'product-banner') else 768
    image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
    target = output / (source.stem + '.webp')
    image.save(target, 'WEBP', quality=84, method=6)
    before += source.stat().st_size
    after += target.stat().st_size
    image.thumbnail((160, 160), Image.Resampling.LANCZOS)
    image.save(output / (source.stem + '-avatar.webp'), 'WEBP', quality=82, method=6)
for size in (96, 400):
    image = ImageOps.exif_transpose(Image.open(ROOT / 'kuncode/app-icon.png')).convert('RGBA')
    image.thumbnail((size, size), Image.Resampling.LANCZOS)
    image.save(ROOT / f'kuncode/app-icon-{size}.webp', 'WEBP', quality=88, method=6)
print(f'Homepage display images: {before / 1024**2:.2f}MiB -> {after / 1024**2:.2f}MiB; KunCode icons: 96px and 400px.')
