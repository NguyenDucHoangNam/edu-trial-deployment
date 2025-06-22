import { Brand } from "@/types/brand";
import Image from "next/image";
import brandsData from "./brandsData";
import SectionTitle from "../Common/SectionTitle";

const Brands = () => {
  return (
    <section className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <SectionTitle
            title="Trường Đại học Đối tác"
            paragraph="Chúng tôi tự hào hợp tác với các trường đại học uy tín trên cả nước để mang đến cho bạn những trải nghiệm học thử chất lượng nhất."
            center
            mb="80px"
        />

        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div
              className="wow fadeInUp bg-gray-light dark:bg-gray-dark flex flex-wrap items-center justify-center rounded-sm px-8 py-8 sm:px-10 md:px-[50px] md:py-[40px] xl:p-[50px] 2xl:px-[70px] 2xl:py-[60px]"
              data-wow-delay=".1s"
            >
              {brandsData.map((brand) => (
                <SingleBrand key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;

const SingleBrand = ({ brand }: { brand: Brand }) => {
  const { href, image, name } = brand;

  return (
    <div className="mx-3 flex w-full max-w-[160px] items-center justify-center py-[15px] sm:mx-4 lg:max-w-[130px] xl:mx-6 xl:max-w-[150px] 2xl:mx-8 2xl:max-w-[160px]">
      <a
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
        className="relative flex h-[70px] w-full items-center justify-center opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 dark:opacity-60 dark:hover:opacity-100"
      >
        <Image
          src={image}
          alt={name}
          className="object-contain w-full h-full"
          width={120}
          height={70}
        />
      </a>

      {/* Thẻ P: Hiển thị tên trường */}
      <p className="mt-2 text-center text-sm font-medium text-body-color dark:text-body-color-dark">
        {name}
      </p>
    </div>
  );
};