document.addEventListener("DOMContentLoaded", function () {
  // Lấy các phần tử DOM
  const excelDataInput = document.getElementById("excelData");
  const classNameInput = document.getElementById("className");
  const amountInput = document.getElementById("amount");
  const generateButton = document.getElementById("generateReceipt");
  const increaseButton = document.getElementById("increaseAmount");
  const decreaseButton = document.getElementById("decreaseAmount");
  const invoiceContainer = document.getElementById("invoiceContainer");
  const receiptDiv = document.getElementById("receipt");
  const downloadButton = document.getElementById("downloadButton");
  const resetButton = document.getElementById("resetButton");

  // Các biến lưu thông tin tính toán
  let sortedDates = [];
  let totalSessions = 0;
  let startDate = "";
  let endDate = "";

  // Tạo biến toàn cục để lưu tên học sinh
  let currentStudentName = "";

  // Xử lý tăng số tiền
  increaseButton.addEventListener("click", function () {
    let currentAmount = parseInt(amountInput.value, 10) || 0;
    currentAmount += 100000;
    amountInput.value = currentAmount;
  });

  // Xử lý giảm số tiền (không giảm xuống dưới 100000)
  decreaseButton.addEventListener("click", function () {
    let currentAmount = parseInt(amountInput.value, 10) || 0;
    currentAmount = Math.max(100000, currentAmount - 100000);
    amountInput.value = currentAmount;
  });

  // Khi nhấn nút "Tạo Biên Lai"
  generateButton.addEventListener("click", function () {
    const excelData = excelDataInput.value.trim();
    const className = classNameInput.value.trim();
    const amount = parseInt(amountInput.value, 10) || 0;

    // Kiểm tra dữ liệu bắt buộc: excelData, lớp và số tiền
    if (!excelData || !className || !amount) {
      alert(
        "⚠️ Vui lòng nhập đầy đủ thông tin (dữ liệu Excel, lớp và số tiền)!"
      );
      return;
    }

    // Phân tách chuỗi từ Excel theo ký tự tab
    const parts = excelData.split(/\t+/).filter(Boolean);
    if (parts.length < 2) {
      alert(
        "❌ Dữ liệu từ Excel không đủ. Vui lòng copy một dòng chứa họ tên và ít nhất 1 ngày học."
      );
      return;
    }
    // Phần đầu tiên là họ tên, các phần còn lại là ngày học
    const studentName = parts[0];
    currentStudentName = studentName; // Lưu tên học sinh vào biến toàn cục
    let attendanceDates = parts.slice(1);

    // Nếu một ngày học chỉ có dạng d/m (không có năm) thì thêm năm hiện tại
    const currentYear = new Date().getFullYear();
    attendanceDates = attendanceDates.map((dateStr) => {
      const tokens = dateStr.split("/");
      if (tokens.length === 2) {
        return `${tokens[0]}/${tokens[1]}/${currentYear}`;
      }
      return dateStr;
    });

    // Tạo đối tượng biên lai
    const receipt = {
      studentName,
      className,
      amount,
      attendanceDates,
    };

    // Tính toán sắp xếp các ngày và xác định số buổi, ngày đầu và ngày cuối
    if (receipt.attendanceDates.length > 0) {
      const datesWithObj = receipt.attendanceDates.map(function (dateStr) {
        const parts = dateStr.split("/");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parts[2];
        return { original: dateStr, dateObj: new Date(year, month - 1, day) };
      });
      datesWithObj.sort((a, b) => a.dateObj - b.dateObj);
      sortedDates = datesWithObj.map((item) => item.original);
      totalSessions = sortedDates.length;
      startDate = sortedDates[0];
      endDate = sortedDates[sortedDates.length - 1];
    }

    // Render hóa đơn và hiển thị container hóa đơn
    renderInvoice({ studentName, className, amount, attendanceDates });
    invoiceContainer.style.display = "block";
  });

  // Hàm tạo nội dung hóa đơn
  function renderInvoice(data) {
    let html = "";

    // Header hóa đơn
    html += '<div class="invoice-header">';
    html += "<h1>BIÊN LAI HỌC PHÍ</h1>";
    html += "</div>";

    // Thông tin hóa đơn
    html += '<div class="invoice-details">';
    html +=
      "<p><strong>Ngày Lập:</strong> " +
      new Date().toLocaleDateString("vi-VN") +
      "</p>";
    html += "</div>";

    // Thông tin học sinh
    html += '<div class="student-info">';
    html += "<p><strong>Học sinh:</strong> " + data.studentName + "</p>";
    html += "<p><strong>Lớp:</strong> " + data.className + "</p>";
    html += "</div>";

    // Thông tin thanh toán
    html += '<div class="payment-info">';
    html +=
      "<p><strong>Số tiền:</strong> " +
      data.amount.toLocaleString("vi-VN") +
      " đ</p>";
    html +=
      "<p><strong>Nội dung:</strong> Thu học phí " +
      totalSessions +
      " buổi từ " +
      startDate +
      " đến " +
      endDate +
      "</p>";
    html += "</div>";

    // Bảng điểm danh
    html += '<div class="attendance-table">';
    html += "<h3>Bảng điểm danh</h3>";
    html += "<table>";
    html +=
      '<thead><tr style="background-color: #f5f5f5;"><th>STT</th><th>Ngày</th><th>Trạng thái</th></tr></thead>';
    html += "<tbody>";
    sortedDates.forEach(function (date, index) {
      html += "<tr>";
      html += '<td style="padding:8px;">' + (index + 1) + "</td>";
      html += '<td style="padding:8px;">' + date + "</td>";
      html += '<td style="padding:8px;">Có học</td>';
      html += "</tr>";
    });
    html += "</tbody></table>";
    html += "</div>";

    // Thông tin thanh toán với mã QR
    html += '<div class="qr-section">';
    html += "<h4>Quét mã để thanh toán</h4>";
    html += '<img src="qr.png" alt="QR Code"/>';
    html += "<p>Vietcombank</p>";
    html += "<p>Số tài khoản: 1020102766</p>";
    html += "<p>Chủ tài khoản: Nguyen Hue Thien</p>";
    html += "</div>";

    html += "</div>";

    receiptDiv.innerHTML = html;
  }

  // Tải hóa đơn dưới dạng ảnh PNG
  downloadButton.addEventListener("click", function () {
    const receiptElement = document.getElementById("receipt");
    if (!receiptElement) {
      alert("⚠ Vui lòng tạo hóa đơn trước khi tải xuống!");
      return;
    }
    // Đảm bảo startDate có giá trị hợp lệ trước khi sử dụng
    if (!startDate) {
      alert("⚠ Không có ngày học hợp lệ để tải hóa đơn!");
      return;
    }
    const parts = startDate.split("/");
    const reversed = parts.slice().reverse().join("-");
    const firstDate = new Date(reversed);
    const monthYear = firstDate.getMonth() + 1 + "-" + firstDate.getFullYear();
    // Sử dụng currentStudentName thay cho studentNameInput.value
    const fileName =
      currentStudentName.replace(/\s+/g, "_") +
      "_Thu_hoc_phi_thang_" +
      monthYear +
      ".png";

    htmlToImage
      .toPng(receiptElement)
      .then(function (dataUrl) {
        download(dataUrl, fileName);
      })
      .catch(function (error) {
        console.error("❌ Lỗi khi tạo ảnh:", error);
        alert("Không thể tạo ảnh hóa đơn. Vui lòng thử lại!");
      });
  });

  // Nút "Biên Lai Mới": reset các trường Excel và lớp (giữ số tiền)
  resetButton.addEventListener("click", function () {
    receiptDiv.innerHTML = "";
    invoiceContainer.style.display = "none";
    excelDataInput.value = "";
    classNameInput.value = "";
    // currentStudentName cũng được reset
    currentStudentName = "";
  });
});
