import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";
const Features = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <SectionTitle
            title="Khám phá Các Tính năng Nổi bật Của Chúng tôi"
            paragraph="EduTrial mang đến bộ công cụ toàn diện và các trải nghiệm độc đáo, đồng hành cùng bạn trên hành trình tìm kiếm và lựa chọn trường đại học phù hợp nhất với bản thân."
            center 
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;