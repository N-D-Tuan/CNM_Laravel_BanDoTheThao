CREATE DATABASE quanlybanhangthethao;
USE quanlybanhangthethao;

-- 1. Bảng User
CREATE TABLE User (
    maNguoiDung INT PRIMARY KEY AUTO_INCREMENT,
    tenNguoiDung VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    soDienThoai VARCHAR(20) NOT NULL,
    matKhau VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    resetOtp VARCHAR(10),
    resetOtpExpiry DATETIME,
    deleted_at TIMESTAMP NULL DEFAULT NULL 
);

-- 2. Bảng Danh mục sản phẩm
CREATE TABLE DanhMucSanPham (
    maDanhMuc INT PRIMARY KEY AUTO_INCREMENT,
    tenDanhMuc VARCHAR(100) NOT NULL
);

-- 3. Bảng Sản phẩm
CREATE TABLE SanPham (
    maSanPham INT PRIMARY KEY AUTO_INCREMENT,
    tenSanPham VARCHAR(100) NOT NULL,
    soLuongTon INT DEFAULT 0,
    giaNhap DECIMAL(18,2),
    giaBan DECIMAL(18,2),
    hinhAnh VARCHAR(255),
    moTa TEXT,
    maDanhMuc INT,
    CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (maDanhMuc) REFERENCES DanhMucSanPham(maDanhMuc) ON DELETE SET NULL
);

-- 4. Bảng Đơn hàng
CREATE TABLE DonHang (
    maDonHang INT PRIMARY KEY AUTO_INCREMENT,
    maNguoiDung INT,
    ngayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50),
    tongTien DECIMAL(18,2),
    diaChi VARCHAR(255) NOT NULL,
    ghiChu VARCHAR(255),
    CONSTRAINT FK_DonHang_User FOREIGN KEY (maNguoiDung) REFERENCES User(maNguoiDung) ON DELETE CASCADE
);

-- 5. Bảng Chi tiết đơn hàng
CREATE TABLE ChiTietDonHang (
    maDonHang INT,
    maSanPham INT,
    soLuong INT NOT NULL,
    PRIMARY KEY (maDonHang, maSanPham),
    CONSTRAINT FK_CTDH_DonHang FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang) ON DELETE CASCADE,
    CONSTRAINT FK_CTDH_SanPham FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE
);

-- 6. Bảng Giỏ hàng
CREATE TABLE GioHang (
    maNguoiDung INT,
    maSanPham INT,
    PRIMARY KEY (maNguoiDung, maSanPham),
    CONSTRAINT FK_GioHang_User FOREIGN KEY (maNguoiDung) REFERENCES User(maNguoiDung) ON DELETE CASCADE,
    CONSTRAINT FK_GioHang_SanPham FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE
);

-- 7. Bảng Đánh giá sản phẩm
CREATE TABLE DanhGiaSanPham (
    maDanhGia INT PRIMARY KEY AUTO_INCREMENT,
    maNguoiDung INT,
    maSanPham INT,
    soSao INT NOT NULL,
    binhLuan TEXT,
    ngayDanhGia DATETIME,
    CONSTRAINT FK_DanhGia_User FOREIGN KEY (maNguoiDung) REFERENCES User(maNguoiDung) ON DELETE CASCADE,
    CONSTRAINT FK_DanhGia_SanPham FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE
);

-- 8. Bảng Tính năng sản phẩm
CREATE TABLE TinhNangSanPham (
    maTinhNang INT PRIMARY KEY AUTO_INCREMENT,
    maSanPham INT,
    tenTinhNang VARCHAR(100),
    CONSTRAINT FK_TinhNang_SanPham FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham) ON DELETE CASCADE
);

-- 1. Bổ sung Unique cho User
ALTER TABLE User ADD CONSTRAINT UC_Email UNIQUE (email);
ALTER TABLE User ADD CONSTRAINT UC_Phone UNIQUE (soDienThoai);
ALTER TABLE User ADD CONSTRAINT CHK_UserRole CHECK (role IN ('Admin', 'Customer'));

-- 2. Bổ sung Check cho Sản phẩm
ALTER TABLE SanPham ADD CONSTRAINT CHK_GiaBan CHECK (giaBan >= 0);
ALTER TABLE SanPham ADD CONSTRAINT CHK_SoLuongTon CHECK (soLuongTon >= 0);
ALTER TABLE SanPham ADD CONSTRAINT CHK_GiaLogic CHECK (giaBan >= giaNhap);

-- 3. Bổ sung Check cho Chi tiết đơn hàng
ALTER TABLE ChiTietDonHang ADD CONSTRAINT CHK_SoLuongMua CHECK (soLuong > 0);

-- 4. Bổ sung Check cho Đánh giá
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT CHK_SoSao CHECK (soSao BETWEEN 1 AND 5);

-- 5. Bổ sung Check cho Đơn hàng
ALTER TABLE DonHang ADD CONSTRAINT CHK_TrangThai CHECK (trangThai IN ('Chờ duyệt', 'Đang giao', 'Đã giao', 'Đã hủy'));

-- 6. Bổ sung cột cho User
ALTER TABLE User ADD COLUMN remember_token VARCHAR(100) NULL AFTER role; 

-- 7. Bổ sung cột cho Sản phẩm
ALTER TABLE sanpham ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 8. Bổ sung cột cho Giỏ hàng
ALTER TABLE GioHang ADD COLUMN soLuong INT DEFAULT 1;

-- 3. Chèn dữ liệu Danh mục
INSERT INTO DanhMucSanPham (tenDanhMuc) VALUES 
('Giày Bóng Đá'),
('Áo Đấu Câu Lạc Bộ'),
('Dụng Cụ Tập Gym'),
('Phụ Kiện Thể Thao');

-- 4. Chèn dữ liệu Sản phẩm
INSERT INTO SanPham (tenSanPham, soLuongTon, giaNhap, giaBan, hinhAnh, moTa, maDanhMuc) VALUES 
('Giày Nike Mercurial', 50, 1500000, 2200000, 'nike_merc.jpg', 'Giày bóng đá cao cấp dành cho sân cỏ nhân tạo.', 1),
('Áo Manchester United 2024', 100, 300000, 550000, 'mu_home.jpg', 'Áo đấu sân nhà mùa giải mới nhất.', 2),
('Tạ tay Rubber 5kg', 30, 200000, 350000, 'ta_tay_5kg.jpg', 'Tạ tay bọc cao su bền bỉ.', 3),
('Băng cuốn cổ chân', 200, 20000, 50000, 'bang_co_chan.jpg', 'Bảo vệ cổ chân khi vận động mạnh.', 4);

-- 5. Chèn dữ liệu Tính năng
INSERT INTO TinhNangSanPham (maSanPham, tenTinhNang) VALUES 
(1, 'Chống nước'),
(1, 'Siêu nhẹ'),
(2, 'Thoát mồ hôi cực tốt'),
(3, 'Cầm nắm chống trượt');