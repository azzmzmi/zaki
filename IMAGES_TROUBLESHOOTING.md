# Product Images Troubleshooting Guide

## Issue: Product Images Not Showing

If you're experiencing issues with product images not displaying, follow these steps:

### Solution 1: Update Image URLs (Recommended)

The image URLs need proper Unsplash parameters for optimal loading. Run this script to update all product images:

```bash
# Make sure backend is running first
python3 << 'EOF'
import requests

BASE_URL = 'http://localhost:8001/api'  # Change if different

# Login as admin
login_response = requests.post(f'{BASE_URL}/auth/login', json={
    'email': 'admin@ecommerce.com',
    'password': 'admin123'
})

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Get all products
    products = requests.get(f'{BASE_URL}/products', headers=headers).json()
    
    # Optimized image URLs with proper parameters
    image_map = {
        "Wireless Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80",
        "Smart Watch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=400&q=80",
        "Laptop Backpack": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&h=400&q=80",
        "Running Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=400&q=80",
        "Coffee Maker": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&h=400&q=80",
        "Yoga Mat": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=400&h=400&q=80",
        "Bluetooth Speaker": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&h=400&q=80",
        "Designer Sunglasses": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80"
    }
    
    print("Updating product images...")
    for product in products:
        if product['name'] in image_map:
            update_data = {
                'name': product['name'],
                'description': product['description'],
                'price': product['price'],
                'category_id': product['category_id'],
                'stock': product['stock'],
                'image_url': image_map[product['name']]
            }
            
            response = requests.put(
                f"{BASE_URL}/products/{product['id']}", 
                json=update_data, 
                headers=headers
            )
            
            if response.status_code == 200:
                print(f"✓ Updated: {product['name']}")
    
    print("\n✅ All images updated!")
    print("Refresh your browser to see the changes.")
else:
    print("Failed to login. Check your credentials.")
EOF
```

### Solution 2: Re-seed Database

If the above doesn't work, re-seed the database with the updated seed script:

```bash
cd backend
python seed_database.py
```

The seed script now includes optimized image URLs with proper parameters.

### Solution 3: Check Network Issues

1. **Open Browser Developer Tools** (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for failed image requests (red status codes)

Common issues:
- **CORS errors**: Images should load from Unsplash with proper CORS headers
- **404 errors**: Image URL is incorrect
- **Network timeout**: Check your internet connection

### Solution 4: Use Alternative Image Source

If Unsplash is blocked or rate-limited in your region, you can use alternative image sources:

**Option A: Use Placeholder Images**
```python
# Update products with placeholder.com images
"image_url": "https://via.placeholder.com/400x400?text=Product+Image"
```

**Option B: Use Local Images**
1. Place images in `backend/uploads/` directory
2. Update product image URLs to use local path:
   ```python
   "image_url": "/uploads/product1.jpg"
   ```

### Solution 5: Upload Custom Images

Through the admin panel:
1. Login as admin: `admin@ecommerce.com` / `admin123`
2. Go to **Admin** → **Products**
3. Click **Edit** on any product
4. Use the **Image Upload** field to upload custom images
5. Images will be stored in `backend/uploads/` directory

### Image URL Format

For best results, Unsplash URLs should follow this format:
```
https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w=400&h=400&q=80
```

Parameters explained:
- `auto=format`: Automatic format optimization (WebP when supported)
- `fit=crop`: Crop to exact dimensions
- `w=400&h=400`: Width and height in pixels
- `q=80`: Quality (1-100, 80 is optimal balance)

### Fallback Image Component

The React components include fallback handling. If an image fails to load, it will:
1. Show the broken image for a moment
2. Eventually display alt text or placeholder

To improve this, you can add error handling in the image components.

### Testing Image URLs

Test if an image URL is accessible:

```bash
# Test from command line
curl -I "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80"

# Should return: HTTP/2 200
```

### Production Considerations

For production deployment:
1. **Use CDN**: Upload images to a CDN (CloudFront, Cloudinary)
2. **Image Optimization**: Pre-process and optimize images
3. **Lazy Loading**: Implement lazy loading for better performance
4. **Responsive Images**: Use srcset for different screen sizes
5. **Caching**: Set proper cache headers

### Still Not Working?

If images still don't show after trying all solutions:

1. Check browser console for errors
2. Verify backend is serving CORS headers correctly
3. Try accessing image URLs directly in a new browser tab
4. Check if your firewall/network is blocking Unsplash
5. Use browser incognito mode to rule out cache issues

## Prevention

To avoid image issues in the future:

1. Always use the updated seed script with proper image URLs
2. Test image URLs before adding products
3. Use image upload feature for custom images
4. Keep a backup of working image URLs
5. Monitor Unsplash API rate limits (50 requests/hour for free tier)

---

For more help, create an issue on GitHub or contact support.
