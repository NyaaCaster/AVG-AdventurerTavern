mport React from 'react';
import { resolveImgPath } from '../utils/imagePath';

interface WeatherIconProps {
  code: string;
  className?: string;
  title?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = "", title }) => {
  // 鏍规嵁鎸囩ず锛屽浘鏍囪矾寰勪慨鏀逛负 img/svg/weather/
  // qweather-icons.json 鏂囦欢璇存槑浜?code 涓庡ぉ姘旂殑瀵瑰簲鍏崇郴锛屾澶勭洿鎺ヤ娇鐢?code 浣滀负鏂囦欢鍚?  const iconPath = `img/svg/weather/${code}.svg`;
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
          // 闅愯棌鍔犺浇澶辫触鐨勫浘鏍囷紝閬垮厤鏄剧ず鐮存崯鍥剧墖鍗犱綅绗﹀奖鍝嶈瑙変綋楠?          (e.target as HTMLImageElement).style.display = 'none';
        }}
    />
  );
};

export default WeatherIcon;
