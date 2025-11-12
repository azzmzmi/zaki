import requests
import sys
import json
from datetime import datetime

class ECommerceAPITester:
    def __init__(self, base_url="https://ecom-fullstack-7.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.customer_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json()
                    details += f", Response: {error_detail}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@ecommerce.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            return True
        return False

    def test_customer_registration(self):
        """Test customer registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "Customer Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": f"test_customer_{timestamp}@test.com",
                "password": "testpass123",
                "full_name": "Test Customer"
            }
        )
        if success and 'access_token' in response:
            self.customer_token = response['access_token']
            return True
        return False

    def test_categories_crud(self):
        """Test categories CRUD operations"""
        if not self.admin_token:
            self.log_test("Categories CRUD", False, "No admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Get categories
        success, categories = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        
        if not success:
            return False

        # Create category
        success, new_category = self.run_test(
            "Create Category",
            "POST",
            "categories",
            200,
            data={"name": "Test Category", "description": "Test Description"},
            headers=headers
        )
        
        if not success:
            return False

        category_id = new_category.get('id')
        if not category_id:
            self.log_test("Categories CRUD", False, "No category ID returned")
            return False

        # Update category
        success, _ = self.run_test(
            "Update Category",
            "PUT",
            f"categories/{category_id}",
            200,
            data={"name": "Updated Test Category", "description": "Updated Description"},
            headers=headers
        )

        # Delete category
        success, _ = self.run_test(
            "Delete Category",
            "DELETE",
            f"categories/{category_id}",
            200,
            headers=headers
        )

        return True

    def test_products_crud(self):
        """Test products CRUD operations"""
        if not self.admin_token:
            self.log_test("Products CRUD", False, "No admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Get categories first to use in product creation
        success, categories = self.run_test(
            "Get Categories for Product",
            "GET",
            "categories",
            200
        )
        
        if not success or not categories:
            self.log_test("Products CRUD", False, "No categories available")
            return False

        category_id = categories[0]['id']

        # Get products
        success, products = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        
        if not success:
            return False

        # Create product
        success, new_product = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data={
                "name": "Test Product",
                "description": "Test Product Description",
                "price": 29.99,
                "category_id": category_id,
                "stock": 10,
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
            },
            headers=headers
        )
        
        if not success:
            return False

        product_id = new_product.get('id')
        if not product_id:
            self.log_test("Products CRUD", False, "No product ID returned")
            return False

        # Get single product
        success, _ = self.run_test(
            "Get Single Product",
            "GET",
            f"products/{product_id}",
            200
        )

        # Update product
        success, _ = self.run_test(
            "Update Product",
            "PUT",
            f"products/{product_id}",
            200,
            data={
                "name": "Updated Test Product",
                "description": "Updated Description",
                "price": 39.99,
                "category_id": category_id,
                "stock": 15
            },
            headers=headers
        )

        # Delete product
        success, _ = self.run_test(
            "Delete Product",
            "DELETE",
            f"products/{product_id}",
            200,
            headers=headers
        )

        return True

    def test_orders_flow(self):
        """Test orders creation and management"""
        if not self.customer_token:
            self.log_test("Orders Flow", False, "No customer token")
            return False

        customer_headers = {'Authorization': f'Bearer {self.customer_token}'}
        
        # Get products to create order
        success, products = self.run_test(
            "Get Products for Order",
            "GET",
            "products",
            200
        )
        
        if not success or not products:
            self.log_test("Orders Flow", False, "No products available")
            return False

        product = products[0]

        # Create order
        success, new_order = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data={
                "items": [{
                    "product_id": product['id'],
                    "product_name": product['name'],
                    "quantity": 2,
                    "price": product['price']
                }],
                "total": product['price'] * 2,
                "shipping_address": "123 Test Street, Test City, TC 12345"
            },
            headers=customer_headers
        )
        
        if not success:
            return False

        order_id = new_order.get('id')
        if not order_id:
            self.log_test("Orders Flow", False, "No order ID returned")
            return False

        # Get orders (customer view)
        success, _ = self.run_test(
            "Get Customer Orders",
            "GET",
            "orders",
            200,
            headers=customer_headers
        )

        # Admin operations
        if self.admin_token:
            admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            # Get all orders (admin view)
            success, _ = self.run_test(
                "Get All Orders (Admin)",
                "GET",
                "orders",
                200,
                headers=admin_headers
            )

            # Update order status
            success, _ = self.run_test(
                "Update Order Status",
                "PUT",
                f"orders/{order_id}/status",
                200,
                data={"status": "processing"},
                headers=admin_headers
            )

        return True

    def test_analytics(self):
        """Test analytics endpoint"""
        if not self.admin_token:
            self.log_test("Analytics", False, "No admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        success, analytics = self.run_test(
            "Get Analytics",
            "GET",
            "analytics",
            200,
            headers=headers
        )
        
        if success:
            required_fields = ['total_users', 'total_products', 'total_orders', 'total_sales']
            for field in required_fields:
                if field not in analytics:
                    self.log_test("Analytics Fields", False, f"Missing field: {field}")
                    return False
            self.log_test("Analytics Fields", True, "All required fields present")

        return success

    def test_users_endpoint(self):
        """Test users endpoint (admin only)"""
        if not self.admin_token:
            self.log_test("Users Endpoint", False, "No admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        success, users = self.run_test(
            "Get Users (Admin)",
            "GET",
            "users",
            200,
            headers=headers
        )

        return success

    def test_protected_routes(self):
        """Test protected routes without authentication"""
        # Test admin-only endpoints without token
        success, _ = self.run_test(
            "Protected Route - Categories Create (No Auth)",
            "POST",
            "categories",
            401,
            data={"name": "Test"}
        )

        success, _ = self.run_test(
            "Protected Route - Analytics (No Auth)",
            "GET",
            "analytics",
            401
        )

        return True

def main():
    print("🚀 Starting eCommerce API Testing...")
    print("=" * 50)
    
    tester = ECommerceAPITester()
    
    # Test sequence
    tests = [
        ("Admin Authentication", tester.test_admin_login),
        ("Customer Registration", tester.test_customer_registration),
        ("Categories CRUD", tester.test_categories_crud),
        ("Products CRUD", tester.test_products_crud),
        ("Orders Flow", tester.test_orders_flow),
        ("Analytics", tester.test_analytics),
        ("Users Endpoint", tester.test_users_endpoint),
        ("Protected Routes", tester.test_protected_routes),
    ]

    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Exception: {str(e)}")

    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Print failed tests
    failed_tests = [result for result in tester.test_results if not result['success']]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())