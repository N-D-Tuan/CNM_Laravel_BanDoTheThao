#Backend

```
├── 📁 app
│   ├── 📁 Http
│   │   └── 📁 Controllers
│   │       ├── 🐘 Controller.php
│   │       ├── 🐘 DanhGiaController.php
│   │       ├── 🐘 DanhMucController.php
│   │       ├── 🐘 DanhMucSanPhamController.php
│   │       ├── 🐘 DonHangController.php
│   │       ├── 🐘 GioHangController.php
│   │       ├── 🐘 LoginFBController.php
│   │       ├── 🐘 LoginGoogleController.php
│   │       ├── 🐘 SanPhamController.php
│   │       ├── 🐘 TinhNangController.php
│   │       ├── 🐘 UserController.php
│   │       └── 🐘 VNPayController.php
│   ├── 📁 Models
│   │   ├── 🐘 Chitietdonhang.php
│   │   ├── 🐘 Danhgiasanpham.php
│   │   ├── 🐘 Danhmucsanpham.php
│   │   ├── 🐘 Donhang.php
│   │   ├── 🐘 Giohang.php
│   │   ├── 🐘 Sanpham.php
│   │   ├── 🐘 Tinhnangsanpham.php
│   │   └── 🐘 User.php
│   └── 📁 Providers
│       └── 🐘 AppServiceProvider.php
├── 📁 bootstrap
│   ├── 🐘 app.php
│   └── 🐘 providers.php
├── 📁 config
│   ├── 🐘 app.php
│   ├── 🐘 auth.php
│   ├── 🐘 cache.php
│   ├── 🐘 cors.php
│   ├── 🐘 database.php
│   ├── 🐘 filesystems.php
│   ├── 🐘 logging.php
│   ├── 🐘 mail.php
│   ├── 🐘 models.php
│   ├── 🐘 queue.php
│   ├── 🐘 sanctum.php
│   ├── 🐘 services.php
│   └── 🐘 session.php
├── 📁 database
│   ├── 📁 factories
│   │   └── 🐘 UserFactory.php
│   ├── 📁 migrations
│   │   ├── 🐘 0001_01_01_000000_create_users_table.php
│   │   ├── 🐘 0001_01_01_000001_create_cache_table.php
│   │   ├── 🐘 0001_01_01_000002_create_jobs_table.php
│   │   ├── 🐘 2025_12_27_152004_create_personal_access_tokens_table.php
│   │   ├── 🐘 2026_01_04_081710_create_trigger_update_stock_on_order_status.php
│   │   └── 🐘 2026_01_08_162935_create_personal_access_tokens_table.php
│   ├── 📁 seeders
│   │   └── 🐘 DatabaseSeeder.php
│   ├── ⚙️ .gitignore
│   └── 📄 database.sqlite
├── 📁 public
│   ├── ⚙️ .htaccess
│   ├── 📄 favicon.ico
│   ├── 🐘 index.php
│   └── 📄 robots.txt
├── 📁 resources
│   ├── 📁 css
│   │   └── 🎨 app.css
│   ├── 📁 js
│   │   ├── 📄 app.js
│   │   └── 📄 bootstrap.js
│   └── 📁 views
│       └── 🐘 welcome.blade.php
├── 📁 routes
│   ├── 🐘 api.php
│   ├── 🐘 console.php
│   └── 🐘 web.php
├── 📁 storage
│   ├── 📁 app
│   │   ├── 📁 private
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 public
│   │   │   ├── 📁 sanpham
│   │   │   │   ├── 🖼️ 5VtAc2CmHt9LG3lDTJbh6UqhUBOHdXrvnalgsC3y.jpg
│   │   │   │   ├── 🖼️ 6ij0bbeUPL6h4Skt8QFQuliBsKBCeXhduhQlSp7d.webp
│   │   │   │   ├── 🖼️ 9C85UzTgIZpk04katg4UDR4OT4F1adaWWvXJ7pxs.webp
│   │   │   │   ├── 🖼️ NAUbylFqDeB0XgboFRV6R0qWEq865Vnfxoit6SQI.jpg
│   │   │   │   ├── 🖼️ Ucw9UPermjyJ4c8FRwkHxE68Tk5vsgWcSJjauTvX.jpg
│   │   │   │   ├── 🖼️ Zh0vwCwksIMdESe42d45CHKR8uuKZ5tJE59DAMLN.webp
│   │   │   │   ├── 🖼️ ZynP7h6LtXhJhMf8v7M4QpxeYqcmzFv67aeBPzj0.jpg
│   │   │   │   ├── 🖼️ boNCtYccTA7O48WurbOWGTKNuKijYUlMBTBnYKjv.jpg
│   │   │   │   ├── 🖼️ dLpmhFsyA7jPAn5iDO4DFhkwKUGm83TwXbJK9dN1.jpg
│   │   │   │   ├── 🖼️ egL4xCOxn5YNhEmOub76L8YnGwkmuY6IhVIgBMCy.jpg
│   │   │   │   ├── 🖼️ mk6cxY710mmrTFsb2vAzrXLvd2R7y2IXTlpeIhKw.jpg
│   │   │   │   ├── 🖼️ qeHQ39hQdcDFK4Au4W6k83mJpMXy9ZHU3ooYLgpr.jpg
│   │   │   │   ├── 🖼️ r10kAUL8z0KTGFilMo5i27qkb6WNIqdFeF0xr9nd.jpg
│   │   │   │   └── 🖼️ yJUWp2auZl4Hc36IDkpNqN9nZpO7dWz1afRSPTGl.webp
│   │   │   └── ⚙️ .gitignore
│   │   └── ⚙️ .gitignore
│   ├── 📁 framework
│   │   ├── 📁 sessions
│   │   │   ├── ⚙️ .gitignore
│   │   │   ├── 📄 484bYmbthqCPud7Z1IR61TFPya52pnd9BfalaAsz
│   │   │   ├── 📄 MpaEGAvqEuuV0yPDA4FVaVALK3rg38uwBgNaNoRC
│   │   │   ├── 📄 TZaaU5aMABVJloERsmxKDUanEUD2jQu7s1qLMNYj
│   │   │   ├── 📄 YCkBSspUfOfYiNEIGuBFp173PYREk5zSWbSFuYq2
│   │   │   ├── 📄 ej4XlvJfQjIa8WADyzcuEwQXPf1r7b6eNUs0jIRN
│   │   │   ├── 📄 t6Yr3yMRIqeMACMfAj0g77dq6C7ZETMpFZSTty43
│   │   │   ├── 📄 t77eLqam4eqybq3xNyn9EZEuQesTtpMxX7Ehs4T4
│   │   │   └── 📄 yTwKc3csmyk4vRofWgpG8rhGY7pPPMZA5jMy0bMg
│   │   ├── 📁 testing
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 views
│   │   │   ├── ⚙️ .gitignore
│   │   │   ├── 🐘 003735b8d769b481dfc07a92a8d56e18.php
│   │   │   ├── 🐘 050f20bed4a446f092a1fe436051a361.php
│   │   │   ├── 🐘 07e351998ffe6ee8ff3d77e7fd7c4879.php
│   │   │   ├── 🐘 114d2b8c09d2dec7884e0e9c102a0ae1.php
│   │   │   ├── 🐘 15dfb9bb7f60d9b9a19d6cced436145f.php
│   │   │   ├── 🐘 1ede4cd0f16fc1cb8566e99805e6de44.php
│   │   │   ├── 🐘 23697b5b47a5d27784fa7253fde63fc0.php
│   │   │   ├── 🐘 2bcd4946af497f16d48aa5800d5c131d.php
│   │   │   ├── 🐘 305bac3dd572b4445a6687ca06ced307.php
│   │   │   ├── 🐘 32caa8cb5dcd22e619cb5e8242b372e0.php
│   │   │   ├── 🐘 369c528964fd205227e8619534cf808f.php
│   │   │   ├── 🐘 397524ccd6f453c9550ee256ee5e247d.php
│   │   │   ├── 🐘 3cebaedb77164b9c0fdf320a39e8b456.php
│   │   │   ├── 🐘 3d2ba21976ac8882f51a77c39093295f.php
│   │   │   ├── 🐘 4036642a6b6d2ca5be8ea0b0de0d80e7.php
│   │   │   ├── 🐘 42ad8c97651792d43d7bf41ad43375ee.php
│   │   │   ├── 🐘 43057ab3aa58d1ed8fdc36763dd079fb.php
│   │   │   ├── 🐘 4a82c8294fd1c98116561726024a6bf5.php
│   │   │   ├── 🐘 4ac2a38643cc253e1e407f7db5183f93.php
│   │   │   ├── 🐘 4d02e8785efb5f0bf040df173db1869d.php
│   │   │   ├── 🐘 592c8d400b7318d15005521a3e5c54cb.php
│   │   │   ├── 🐘 59b8df56e58d6e62aec5919f22af2d06.php
│   │   │   ├── 🐘 72ce5d80a71d2540c0afc737f63839b5.php
│   │   │   ├── 🐘 7568638f80219624ac72e90060170316.php
│   │   │   ├── 🐘 7e03dda6db2b04c9565632f17dac08a4.php
│   │   │   ├── 🐘 7f611350746c5485c65f58a2ad87ef25.php
│   │   │   ├── 🐘 80551c0574bbafacf6890f808a8a5799.php
│   │   │   ├── 🐘 842c8455e461892caa997287fa40eb32.php
│   │   │   ├── 🐘 87b078c643085d13fb60a1acdc239fb0.php
│   │   │   ├── 🐘 8c74d0b3cf3ce43126717fd047f81e5f.php
│   │   │   ├── 🐘 947b97602e6f59c0518543781a8e5425.php
│   │   │   ├── 🐘 950d9f1ca00289626e599322a459e6f6.php
│   │   │   ├── 🐘 9613c402f0fdda6a59c34d16e4a66263.php
│   │   │   ├── 🐘 98dee507a46cd1f4ad6b5ab4ccbd1d6b.php
│   │   │   ├── 🐘 a3e2d82afe4ee6076d4f5dedad21bcbb.php
│   │   │   ├── 🐘 a76db0be7db4260b201a1273348f4bd6.php
│   │   │   ├── 🐘 b74c52dd00b06ae7c1f52fb037030fc9.php
│   │   │   ├── 🐘 b7c83aa54f78e915be7dcb8a482844a9.php
│   │   │   ├── 🐘 b8521d6917f01b92ec8a0bade801d7af.php
│   │   │   ├── 🐘 c51b19eef0a0a49ad3e139f9638e0a3d.php
│   │   │   ├── 🐘 c7648e1fc7c845607b1426faa6b4d9fd.php
│   │   │   ├── 🐘 c844bc15418c60c9c2809e0e266ce395.php
│   │   │   ├── 🐘 c87ca84864b9daf9a165fa4cb5b4acad.php
│   │   │   ├── 🐘 c9427da9533c0d754254b66bce61f25f.php
│   │   │   ├── 🐘 ca177826a161a87bf9c9f010b7071f66.php
│   │   │   ├── 🐘 cd35f9e032c2ab002a14f5e591be5885.php
│   │   │   ├── 🐘 ce57b2ddff9202a90592bf0b4a8f67bb.php
│   │   │   ├── 🐘 d14db5f5c76c7aa2ab5ddd626d221a75.php
│   │   │   ├── 🐘 d1978d9cb19f32baeadb595a08521025.php
│   │   │   ├── 🐘 d534885fb5861b76a64131f42e9a6326.php
│   │   │   ├── 🐘 d804732146e66778b4a9c01cdc725379.php
│   │   │   ├── 🐘 d8e4d228739c679a55bf9aeb4794e373.php
│   │   │   ├── 🐘 e1b8c11e66d8762a3614b87a17804fa9.php
│   │   │   ├── 🐘 e66ba1f8f12844506e557dc1fd734a4c.php
│   │   │   ├── 🐘 e68df6192806b83e329aad58f00a5020.php
│   │   │   ├── 🐘 f349e54bf32c26cdaedaba7f5ab691c9.php
│   │   │   ├── 🐘 f38b4b0f92cd52556b546d3787783ad0.php
│   │   │   ├── 🐘 f76922a895b67f024f8b61506a44002f.php
│   │   │   ├── 🐘 f95e5b27ea48d25de97b1c7838d0671e.php
│   │   │   ├── 🐘 ff45aba99d1d8e10ec320410c621cd9e.php
│   │   │   └── 🐘 fff8f1d0c3d0e29b32574953db5a27d1.php
│   │   └── ⚙️ .gitignore
│   └── 📁 logs
│       └── ⚙️ .gitignore
├── 📁 tests
│   ├── 📁 Feature
│   │   └── 🐘 ExampleTest.php
│   ├── 📁 Unit
│   │   └── 🐘 ExampleTest.php
│   └── 🐘 TestCase.php
├── ⚙️ .editorconfig
├── ⚙️ .env.example
├── ⚙️ .gitattributes
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 artisan
├── 🐘 composer-setup.php
├── ⚙️ composer.json
├── 📄 composer.phar
├── ⚙️ package.json
├── ⚙️ phpunit.xml
└── 📄 vite.config.js
```


#Frontend

```
├── 📁 components
│   ├── 🌐 footer.html
│   └── 🌐 header.html
├── 📁 pages
│   ├── 🌐 admin-dashboard.html
│   ├── 🌐 change-password.html
│   ├── 🌐 forgot-password.html
│   ├── 🌐 gio-hang.html
│   ├── 🌐 login.html
│   ├── 🌐 order-user.html
│   ├── 🌐 product-detail.html
│   ├── 🌐 profile.html
│   ├── 🌐 register.html
│   ├── 🌐 reset-password.html
│   ├── 🌐 san-pham.html
│   └── 🌐 trang-chu.html
├── 📁 root
│   ├── 📁 css
│   │   ├── 🎨 cart.css
│   │   ├── 🎨 order-management.css
│   │   ├── 🎨 product-detail.css
│   │   ├── 🎨 product.css
│   │   ├── 🎨 style.css
│   │   └── 🎨 user-orders.css
│   └── 📁 js
│       ├── 📄 admin.js
│       ├── 📄 auth.js
│       ├── 📄 cart.js
│       ├── 📄 main.js
│       ├── 📄 order-management.js
│       ├── 📄 product-detail.js
│       ├── 📄 product.js
│       └── 📄 user-orders.js
└── 🌐 index.html
```
