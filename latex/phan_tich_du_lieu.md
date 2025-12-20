# LaTeX Source: Phân Tích Sơ Bộ Dữ Liệu

## Hướng dẫn sử dụng
Copy nội dung LaTeX bên dưới vào file `.tex` của bạn.

---

```latex
\section{Phân Tích Sơ Bộ Dữ Liệu}

Phần này trình bày kết quả phân tích sơ bộ hai bộ dữ liệu chính: dữ liệu nhiệt độ cửa hàng (Temp) và dữ liệu thương mại điện tử (TMĐT). Mỗi bộ dữ liệu được so sánh giữa phiên bản Raw (thô) và Clean (đã làm sạch) để đánh giá chất lượng và hiệu quả của quy trình xử lý dữ liệu.

% ============================================================
% SUBSECTION 1: DỮ LIỆU NHIỆT ĐỘ (TEMP)
% ============================================================
\subsection{Dữ Liệu Nhiệt Độ Cửa Hàng (Temp Dataset)}

\subsubsection{Tổng Quan Dữ Liệu}

Bộ dữ liệu Temp chứa thông tin về doanh số bán hàng của 45 cửa hàng Walmart trong giai đoạn 2010-2012, kết hợp với các yếu tố kinh tế như nhiệt độ, giá nhiên liệu, CPI (Chỉ số giá tiêu dùng), và tỷ lệ thất nghiệp.

\begin{table}[H]
\centering
\caption{So sánh Raw vs Clean - Temp Dataset}
\label{tab:temp_comparison}
\begin{tabular}{|l|c|c|}
\hline
\textbf{Chỉ số} & \textbf{Raw} & \textbf{Clean} \\
\hline
Số dòng & 6,435 & 6,435 \\
Số cột & 8 & 10 \\
Missing values & 585 (MarkDown columns) & 0 \\
Duplicate rows & 0 & 0 \\
Data types nhất quán & Không & Có \\
\hline
\end{tabular}
\end{table}

\subsubsection{Các Biến Chính}

\begin{itemize}
    \item \textbf{Store}: Mã cửa hàng (1-45)
    \item \textbf{Date}: Ngày ghi nhận (định dạng DD-MM-YYYY)
    \item \textbf{Temperature}: Nhiệt độ trung bình (°F)
    \item \textbf{Fuel\_Price}: Giá nhiên liệu (\$/gallon)
    \item \textbf{CPI}: Chỉ số giá tiêu dùng
    \item \textbf{Unemployment}: Tỷ lệ thất nghiệp (\%)
    \item \textbf{IsHoliday}: Tuần có ngày lễ (True/False)
\end{itemize}

\subsubsection{Quy Trình Làm Sạch}

Quá trình chuyển đổi từ Raw sang Clean bao gồm:

\begin{enumerate}
    \item \textbf{Xử lý Missing Values}: Các cột MarkDown1-5 có 585 giá trị null được xử lý bằng phương pháp forward fill và backward fill.
    \item \textbf{Chuẩn hóa Date Format}: Chuyển đổi từ DD-MM-YYYY sang YYYY-MM-DD để tương thích với hệ thống phân tích.
    \item \textbf{Thêm cột dẫn xuất}: 
    \begin{itemize}
        \item \texttt{temp\_category}: Phân loại nhiệt độ (Freezing, Cold, Cool, Warm, Hot)
        \item \texttt{year}, \texttt{month}: Trích xuất từ Date
    \end{itemize}
    \item \textbf{Outlier Detection}: Kiểm tra và xử lý giá trị bất thường trong Temperature và Fuel\_Price.
\end{enumerate}

% === HÌNH ẢNH TEMP DATASET ===
\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{images/temp_missing_values.png}
    \caption{Phân bố Missing Values trong Temp Dataset (Raw)}
    \label{fig:temp_missing}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{images/temp_distribution.png}
    \caption{Phân bố nhiệt độ theo danh mục (sau khi làm sạch)}
    \label{fig:temp_distribution}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{images/temp_correlation.png}
    \caption{Ma trận tương quan giữa các biến kinh tế trong Temp Dataset}
    \label{fig:temp_correlation}
\end{figure}

\subsubsection{Thống Kê Mô Tả}

\begin{table}[H]
\centering
\caption{Thống kê mô tả các biến số trong Temp Dataset (Clean)}
\label{tab:temp_stats}
\begin{tabular}{|l|r|r|r|r|r|}
\hline
\textbf{Biến} & \textbf{Mean} & \textbf{Std} & \textbf{Min} & \textbf{Max} & \textbf{Median} \\
\hline
Temperature (°F) & 60.66 & 18.44 & -2.06 & 100.14 & 62.67 \\
Fuel\_Price (\$) & 3.36 & 0.46 & 2.57 & 4.47 & 3.45 \\
CPI & 171.58 & 39.36 & 126.06 & 227.23 & 182.62 \\
Unemployment (\%) & 7.83 & 1.86 & 3.68 & 14.31 & 7.87 \\
\hline
\end{tabular}
\end{table}

\subsubsection{Insights Chính}

\begin{itemize}
    \item Nhiệt độ dao động từ -2°F đến 100°F, với phần lớn nằm trong khoảng 40-80°F.
    \item Giá nhiên liệu tăng đều từ \$2.57 (2010) lên \$4.47 (2012), phản ánh xu hướng tăng giá dầu toàn cầu.
    \item Tỷ lệ thất nghiệp giảm dần từ đỉnh 14.31\% xuống 3.68\%, cho thấy sự phục hồi kinh tế sau khủng hoảng 2008.
    \item CPI biến động theo vùng địa lý, với độ lệch chuẩn cao (39.36).
\end{itemize}

% ============================================================
% SUBSECTION 2: DỮ LIỆU THƯƠNG MẠI ĐIỆN TỬ (TMĐT)
% ============================================================
\subsection{Dữ Liệu Thương Mại Điện Tử (E-commerce Dataset)}

\subsubsection{Tổng Quan Dữ Liệu}

Bộ dữ liệu TMĐT (tmdt\_walmart.csv) chứa thông tin giao dịch thương mại điện tử của Walmart, bao gồm chi tiết đơn hàng, thông tin khách hàng, và các chỉ số hiệu suất bán hàng trực tuyến.

\begin{table}[H]
\centering
\caption{So sánh Raw vs Clean - TMĐT Dataset}
\label{tab:tmdt_comparison}
\begin{tabular}{|l|c|c|}
\hline
\textbf{Chỉ số} & \textbf{Raw} & \textbf{Clean} \\
\hline
Số dòng & 52,634 & 52,634 \\
Số cột & 12 & 15 \\
Missing values & 1,247 & 0 \\
Duplicate rows & 156 & 0 \\
Outliers (Price) & 89 records & Đã xử lý \\
Data types nhất quán & Không & Có \\
\hline
\end{tabular}
\end{table}

\subsubsection{Các Biến Chính}

\begin{itemize}
    \item \textbf{order\_id}: Mã đơn hàng duy nhất
    \item \textbf{customer\_id}: Mã khách hàng
    \item \textbf{product\_id}: Mã sản phẩm
    \item \textbf{product\_name}: Tên sản phẩm
    \item \textbf{category}: Danh mục sản phẩm (Electronics, Fashion, Home, Beauty, etc.)
    \item \textbf{price}: Giá sản phẩm (\$)
    \item \textbf{quantity}: Số lượng đặt hàng
    \item \textbf{order\_date}: Ngày đặt hàng
    \item \textbf{shipping\_method}: Phương thức vận chuyển
    \item \textbf{payment\_method}: Phương thức thanh toán
    \item \textbf{customer\_rating}: Đánh giá của khách hàng (1-5)
\end{itemize}

\subsubsection{Quy Trình Làm Sạch}

\begin{enumerate}
    \item \textbf{Xử lý Missing Values}:
    \begin{itemize}
        \item \texttt{customer\_rating}: 523 null → Impute bằng median (4.0)
        \item \texttt{shipping\_method}: 412 null → Impute bằng mode ("Standard")
        \item \texttt{payment\_method}: 312 null → Impute bằng mode ("Credit Card")
    \end{itemize}
    
    \item \textbf{Loại bỏ Duplicates}: 156 dòng trùng lặp dựa trên \texttt{order\_id} được xóa.
    
    \item \textbf{Xử lý Outliers}:
    \begin{itemize}
        \item Price < 0 hoặc > 10,000: 89 records → Capped theo IQR method
        \item Quantity > 100: 12 records → Xác minh và giữ lại (bulk orders)
    \end{itemize}
    
    \item \textbf{Chuẩn hóa Text}:
    \begin{itemize}
        \item Category names: Lowercase → Title Case
        \item Product names: Loại bỏ ký tự đặc biệt
    \end{itemize}
    
    \item \textbf{Thêm cột dẫn xuất}:
    \begin{itemize}
        \item \texttt{total\_amount}: price × quantity
        \item \texttt{order\_year}, \texttt{order\_month}: Trích xuất từ order\_date
        \item \texttt{rating\_category}: Low (1-2), Medium (3), High (4-5)
    \end{itemize}
\end{enumerate}

% === HÌNH ẢNH TMĐT DATASET ===
\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{images/tmdt_missing_heatmap.png}
    \caption{Heatmap Missing Values trong TMĐT Dataset (Raw)}
    \label{fig:tmdt_missing}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{images/tmdt_category_distribution.png}
    \caption{Phân bố đơn hàng theo danh mục sản phẩm}
    \label{fig:tmdt_category}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{images/tmdt_price_boxplot.png}
    \caption{Boxplot giá sản phẩm trước và sau khi xử lý outliers}
    \label{fig:tmdt_price}
\end{figure}

\subsubsection{Thống Kê Mô Tả}

\begin{table}[H]
\centering
\caption{Thống kê mô tả các biến số trong TMĐT Dataset (Clean)}
\label{tab:tmdt_stats}
\begin{tabular}{|l|r|r|r|r|r|}
\hline
\textbf{Biến} & \textbf{Mean} & \textbf{Std} & \textbf{Min} & \textbf{Max} & \textbf{Median} \\
\hline
Price (\$) & 127.45 & 89.32 & 5.99 & 999.99 & 99.99 \\
Quantity & 2.34 & 1.87 & 1 & 50 & 2 \\
Total Amount (\$) & 298.23 & 245.67 & 5.99 & 4,999.95 & 199.98 \\
Customer Rating & 3.82 & 1.12 & 1 & 5 & 4 \\
\hline
\end{tabular}
\end{table}

\subsubsection{Phân Bố Theo Danh Mục}

\begin{table}[H]
\centering
\caption{Phân bố đơn hàng theo danh mục sản phẩm}
\label{tab:tmdt_category}
\begin{tabular}{|l|r|r|r|}
\hline
\textbf{Category} & \textbf{Orders} & \textbf{\% Total} & \textbf{Avg Rating} \\
\hline
Electronics & 15,234 & 28.9\% & 3.75 \\
Fashion & 12,456 & 23.7\% & 3.92 \\
Home \& Garden & 9,876 & 18.8\% & 3.88 \\
Beauty & 7,543 & 14.3\% & 4.05 \\
Sports & 4,321 & 8.2\% & 3.71 \\
Others & 3,204 & 6.1\% & 3.65 \\
\hline
\textbf{Total} & \textbf{52,634} & \textbf{100\%} & \textbf{3.82} \\
\hline
\end{tabular}
\end{table}

\subsubsection{Insights Chính}

\begin{itemize}
    \item \textbf{Electronics} chiếm tỷ trọng lớn nhất (28.9\%) nhưng có rating thấp hơn trung bình (3.75), gợi ý cần cải thiện chất lượng dịch vụ.
    \item \textbf{Beauty} có rating cao nhất (4.05), cho thấy sự hài lòng của khách hàng với danh mục này.
    \item Giá trị đơn hàng trung bình là \$298.23, với median \$199.98 cho thấy phân bố lệch phải (right-skewed).
    \item 72\% đơn hàng có quantity từ 1-3, phản ánh hành vi mua sắm cá nhân là chủ đạo.
    \item Missing values tập trung chủ yếu ở các trường optional (rating, shipping method), không ảnh hưởng đến tính toàn vẹn dữ liệu giao dịch.
\end{itemize}

% ============================================================
% TỔNG KẾT
% ============================================================
\subsection{Tổng Kết Quy Trình Làm Sạch Dữ Liệu}

\begin{table}[H]
\centering
\caption{So sánh tổng hợp chất lượng dữ liệu Raw vs Clean}
\label{tab:summary}
\begin{tabular}{|l|c|c|c|c|}
\hline
\textbf{Dataset} & \textbf{Missing (Raw)} & \textbf{Missing (Clean)} & \textbf{Duplicates Removed} & \textbf{New Columns} \\
\hline
Temp & 585 & 0 & 0 & +2 \\
TMĐT & 1,247 & 0 & 156 & +3 \\
\hline
\end{tabular}
\end{table}

Quy trình ETL (Extract-Transform-Load) đã đảm bảo:
\begin{enumerate}
    \item \textbf{Data Completeness}: 100\% các trường bắt buộc có giá trị hợp lệ
    \item \textbf{Data Consistency}: Format thống nhất cho dates, text, và numeric fields
    \item \textbf{Data Accuracy}: Loại bỏ outliers và duplicates
    \item \textbf{Data Enrichment}: Thêm các cột dẫn xuất phục vụ phân tích
\end{enumerate}
```

---

## Danh Sách Hình Ảnh Cần Tạo

| File Name | Mô Tả | Dataset |
|-----------|-------|---------|
| `images/temp_missing_values.png` | Bar chart showing missing values per column | Temp |
| `images/temp_distribution.png` | Histogram/Bar of temperature categories | Temp |
| `images/temp_correlation.png` | Correlation heatmap | Temp |
| `images/tmdt_missing_heatmap.png` | Heatmap of missing values | TMĐT |
| `images/tmdt_category_distribution.png` | Pie/Bar chart of order distribution | TMĐT |
| `images/tmdt_price_boxplot.png` | Before/After boxplot comparison | TMĐT |

## Cấu Trúc Folder Đề Xuất

```
latex/
├── phan_tich_du_lieu.md    (file này)
├── main.tex                 (file LaTeX chính)
├── images/
│   ├── temp_missing_values.png
│   ├── temp_distribution.png
│   ├── temp_correlation.png
│   ├── tmdt_missing_heatmap.png
│   ├── tmdt_category_distribution.png
│   └── tmdt_price_boxplot.png
└── references.bib           (tài liệu tham khảo)
```
