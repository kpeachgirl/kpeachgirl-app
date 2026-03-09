import Image from 'next/image';
import type { CropData } from '@/lib/types';
import { cropStyle } from '@/lib/utils';

interface PhotoCropDisplayProps {
  src: string;
  alt: string;
  crop?: CropData | null;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function PhotoCropDisplay({
  src,
  alt,
  crop,
  className,
  fill = true,
  width,
  height,
  priority,
}: PhotoCropDisplayProps) {
  if (!src) {
    return (
      <div
        className={`bg-muted/20 ${className || ''}`}
        style={fill ? { position: 'relative', width: '100%', height: '100%' } : { width, height }}
      />
    );
  }

  const style = cropStyle(crop);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className || ''}`}
        style={style}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 600}
      className={`object-cover ${className || ''}`}
      style={style}
      priority={priority}
    />
  );
}
