const Contact = () => {
  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        {/* Changed: Removed the flex container and column divs */}
        <div
          className="wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
          data-wow-delay=".15s"
        >
          {/* Tiêu đề biểu mẫu */}
          <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
            Liên hệ với Edutrial
          </h2>
          {/* Đoạn giới thiệu biểu mẫu */}
          <p className="mb-12 text-base font-medium text-body-color">
            Nếu bạn có bất kỳ câu hỏi nào về Edutrial, các khóa học thử, quy
            trình đăng ký, hoặc muốn tìm hiểu cơ hội hợp tác, xin đừng ngần
            ngại gửi tin nhắn cho chúng tôi qua biểu mẫu dưới đây.
          </p>
          {/* Biểu mẫu */}
          <form>
            <div className="-mx-4 flex flex-wrap">
              {/* Trường Tên */}
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-8">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên của bạn"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  />
                </div>
              </div>
              {/* Trường Email */}
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-8">
                  <label
                  htmlFor="email"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Email của bạn
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ Email của bạn"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  />
                </div>
              </div>
              {/* Trường Nội dung tin nhắn */}
              <div className="w-full px-4">
                <div className="mb-8">
                  <label
                    htmlFor="message"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Nội dung tin nhắn
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn của bạn"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full resize-none rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  ></textarea>
                </div>
              </div>
              {/* Nút Gửi */}
              <div className="w-full px-4">
                <button className="shadow-submit dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
                  Gửi tin nhắn
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;