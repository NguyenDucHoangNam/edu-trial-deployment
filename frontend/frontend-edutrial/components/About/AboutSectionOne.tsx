import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const AboutSectionOne = () => {
  return (
    <section id="about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <SectionTitle
                title="Về Nền tảng Edutrial - Đồng Hành Cùng Bạn Chọn Trường"
                paragraph="Việc lựa chọn trường đại học và ngành học phù hợp là một trong những quyết định quan trọng nhất cuộc đời mỗi học sinh. Tuy nhiên, với áp lực thi cử và lượng thông tin khổng lồ, nhiều bạn cảm thấy bối rối, không chắc chắn, và thiếu cơ hội trải nghiệm thực tế để đưa ra lựa chọn đúng đắn."
                mb="44px"
              />

              <div
                className="wow fadeInUp mb-12 max-w-[570px] lg:mb-0"
                data-wow-delay=".15s"
              >
                <p className="mb-5 text-base !leading-relaxed text-body-color dark:text-body-color-dark md:text-lg">
                 Hiểu được những thách thức đó, Edutrial ra đời với sứ mệnh trở thành cầu nối tin cậy, mang thế giới đại học đến gần hơn với học sinh THPT. Chúng tôi tin rằng trải nghiệm thực tế chính là chìa khóa giúp bạn tự tin định hướng tương lai.
                </p>
                <p className="mb-0 text-base !leading-relaxed text-body-color dark:text-body-color-dark md:text-lg">
                 Thay vì chỉ tìm hiểu qua thông tin giới thiệu, Edutrial cho phép bạn 'sống thử' cuộc sống sinh viên. Bạn có thể dễ dàng truy cập, tham gia các khóa học thử được cung cấp bởi chính các trường đại học hàng đầu, làm quen với phương pháp giảng dạy, nội dung môn học và cảm nhận rõ hơn về môi trường bạn có thể theo học trong tương lai.
                </p>
              </div>
            </div>

            <div className="w-full px-4 lg:w-1/2">
              <div
                className="wow fadeInUp relative mx-auto aspect-[25/24] max-w-[500px] lg:mr-0"
                data-wow-delay=".2s"
              >
                <Image
                  src="/images/about/university-platform-about.jpg"
                  alt="about-image"
                  fill
                  className="drop-shadow-three mx-auto max-w-full dark:hidden dark:drop-shadow-none lg:mr-0"
                />
                <Image
                  src="/images/about/university-platform-about-dark.svg"
                  alt="about-image"
                  fill
                  className="drop-shadow-three mx-auto hidden max-w-full dark:block dark:drop-shadow-none lg:mr-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;