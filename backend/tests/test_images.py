import unittest
from app.services.image_service import generate_unique_filename

class TestImageService(unittest.TestCase):
    def test_unique_filename_generation(self):
        fn1 = generate_unique_filename("biscuit.jpg")
        fn2 = generate_unique_filename("biscuit.jpg")
        self.assertNotEqual(fn1, fn2)
        self.assertTrue(fn1.endswith(".jpg"))

if __name__ == "__main__":
    unittest.main()
