// Đảm bảo đoạn mã được thực thi sau khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function () {
  // Lấy các phần tử DOM của form và hóa đơn
  const studentNameInput = document.getElementById("studentName");
  const classNameInput = document.getElementById("className");
  const amountInput = document.getElementById("amount");
  const datesInput = document.getElementById("dates");
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
    const studentName = studentNameInput.value.trim();
    const className = classNameInput.value.trim();
    const amount = parseInt(amountInput.value, 10) || 0;
    const dates = datesInput.value.trim();

    // Kiểm tra dữ liệu bắt buộc: nếu không đủ thì không tạo hóa đơn
    if (!studentName || !className || !amount || !dates) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const currentYear = new Date().getFullYear();
    const dateStrings = dates.split(" ");
    const attendanceDates = [];

    // Xử lý chuỗi ngày học (định dạng mong đợi: d/m)
    for (let dateStr of dateStrings) {
      dateStr = dateStr.trim();
      if (!dateStr) continue;
      const parts = dateStr.split("/");
      if (parts.length !== 2) {
        alert(
          `❌ Sai định dạng ngày: ${dateStr}. Vui lòng nhập theo định dạng d/m`
        );
        return;
      }
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      if (month > 12 || month < 1 || day < 1 || day > 31) {
        alert(`❌ Ngày không hợp lệ: ${dateStr}`);
        return;
      }
      attendanceDates.push(`${day}/${month}/${currentYear}`);
    }

    // Tạo đối tượng biên lai từ dữ liệu nhập
    const receipt = {
      studentName,
      className,
      amount,
      attendanceDates,
    };

    // Tính toán sắp xếp các ngày và các thông tin liên quan
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

    // Render hóa đơn dựa trên dữ liệu nhập và hiển thị container hóa đơn
    renderInvoice(receipt);
    invoiceContainer.style.display = "block";
  });

  // Hàm tạo nội dung hóa đơn
  function renderInvoice(data) {
    let html = "";

    // Header hóa đơn
    html += '<div class="invoice-header">';
    html += "<h1>BIÊN LAI HỌC PHÍ</h1>";
    html += "</div>";
    html += "<br>";
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
    html += "<br>";

    // Thông tin thanh toán với mã QR
    html += '<div class="qr-section">';
    html += "<h4>Quét mã để thanh toán</h4>";
    html += '<img src="qr.png" alt="QR Code"/>';
    html += "<p>Vietcombank</p>";
    html += "<p>Số tài khoản: 1020102766</p>";
    html += "<p>Chủ tài khoản: Nguyen Hue Thien</p>";
    html += "</div>";

    // Footer hóa đơn
    html += '<div class="invoice-footer">';
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
    const parts = startDate.split("/");
    const reversed = parts.slice().reverse().join("-");
    const firstDate = new Date(reversed);
    const monthYear = firstDate.getMonth() + 1 + "-" + firstDate.getFullYear();
    const fileName =
      studentNameInput.value.trim() +
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

  // Nút "Biên Lai Mới" reset lại các trường: họ tên, lớp và ngày học (không reset số tiền)
  resetButton.addEventListener("click", function () {
    receiptDiv.innerHTML = "";
    invoiceContainer.style.display = "none";
    studentNameInput.value = "";
    classNameInput.value = "";
    datesInput.value = "";
  });
});
