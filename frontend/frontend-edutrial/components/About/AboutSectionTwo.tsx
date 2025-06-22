import Image from "next/image";
// Không cần import SectionTitle ở đây vì component gốc không sử dụng

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          {/* Cột trái: Phần hình ảnh minh họa */}
          <div className="w-full px-4 lg:w-1/2">
            <div
              className="wow fadeInUp relative mx-auto mb-12 aspect-[25/24] max-w-[500px] text-center lg:m-0"
              data-wow-delay=".15s"
            >
              {/* Ảnh cho chế độ sáng (cập nhật đường dẫn ảnh phù hợp) */}
              <Image
                src="/images/about/ai-analysis-about.jpg" // <-- Cập nhật đường dẫn ảnh minh họa phù hợp
                alt="about image" // Alt text mô tả ảnh (ví dụ: Biểu đồ phân tích dữ liệu)
                fill
                className="drop-shadow-three dark:hidden dark:drop-shadow-none"
              />
              {/* Ảnh cho chế độ tối (cập nhật đường dẫn ảnh phù hợp) */}
              <Image
                src="/images/about/ai-analysis-about-dark.svg" // <-- Cập nhật đường dẫn ảnh minh họa cho dark mode (hoặc dùng chung ảnh sáng)
                alt="about image" // Alt text mô tả ảnh
                fill
                className="drop-shadow-three hidden dark:block dark:drop-shadow-none"
              />
            </div>
          </div>
          {/* Cột phải: Phần văn bản giới thiệu chi tiết */}
          <div className="w-full px-4 lg:w-1/2">
            <div className="wow fadeInUp max-w-[470px]" data-wow-delay=".2s">
              {/* Thêm tiêu đề chính cho phần này */}
               <h2 className="mb-9 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
                  Định hướng Khoa học & Hỗ trợ Tận tâm
               </h2>
              {/* Khối nội dung 1: Quiz, Khảo sát và Thu thập dữ liệu */}
              {/* <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Thu thập Dữ liệu Trải nghiệm
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Hành trình khám phá không dừng lại ở việc học. Sau mỗi khóa học thử, bạn sẽ có cơ hội củng cố kiến thức và đánh giá mức độ phù hợp qua các bài quiz tương tác và khảo sát chuyên sâu. Đây là cách Edutrial cùng bạn thu thập những dữ liệu quý giá về sở thích, năng lực và mức độ phù hợp của bạn với từng lĩnh vực.
                </p>
              </div> */}
              {/* Khối nội dung 2: Phân tích thông minh bằng AI */}
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Phân tích Chuyên sâu bằng AI
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Dữ liệu từ các bài quiz, khảo sát và cả quá trình trải nghiệm của bạn sẽ được hệ thống AI tiên tiến của Edutrial phân tích một cách chuyên sâu. AI sẽ giúp nhận diện các mẫu hình, làm nổi bật những điểm mạnh tiềm ẩn và đưa ra những gợi ý chính xác về các nhóm ngành, ngành học và trường đại học có tiềm năng phù hợp cao nhất với bạn.
                </p>
              </div>
              {/* Khối nội dung 3: Kết nối và Nhận tư vấn chuyên sâu */}
              <div className="mb-1"> {/* Giữ mb-1 như code gốc cho mục cuối */}
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Kết nối & Nhận Tư vấn Từ Trường
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Dựa trên kết quả phân tích từ AI, bạn sẽ nhận được báo cáo chi tiết về định hướng. Edutrial tạo điều kiện để bạn chủ động kết nối trực tiếp với đại diện các trường đại học mà bạn quan tâm hoặc được hệ thống gợi ý để được giải đáp mọi thắc mắc và có thêm thông tin trước khi quyết định.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;