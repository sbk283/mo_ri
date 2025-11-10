// 이미지 최적화 처리 컴포넌트
import { useEffect, useRef, useState } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
}

export default function LazyImage({
  src,
  alt = "",
  placeholder,
  className,
  ...rest
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // IntersectionObserver 설정
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        // rootMargin: 화면에 나오기 300px 전에 로딩 시작
        rootMargin: "300px 0px",
      },
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={visible ? src : (placeholder ?? "")}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
      }`}
      loading="lazy"
      {...rest}
    />
  );
}
