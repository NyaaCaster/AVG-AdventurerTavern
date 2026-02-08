import React from 'react';
import { resolveImgPath } from '../utils/imagePath';

interface WeatherIconProps {
  code: string;
  className?: string;
  title?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = "", title }) => {
  // 根据指示，图标路径修改为 img/svg/weather/
  // qweather-icons.json 文件说明了 code 与天气的对应关系，此处直接使用 code 作为文件名
  const iconPath = `img/svg/weather/${code}.svg`;
  const iconUrl = resolveImgPath(iconPath);

  if (!code || !iconUrl) {
      return null;
  }

  return (
    <img 
        src={iconUrl} 
        alt={title || `Weather ${code}`} 
        className={`w-full h-full object-contain ${className}`}
        title={title}
        loading="lazy"
        onError={(e) => {
          // 隐藏加载失败的图标，避免显示破损图片占位符影响视觉体验
          (e.target as HTMLImageElement).style.display = 'none';
        }}
    />
  );
};

export default WeatherIcon;