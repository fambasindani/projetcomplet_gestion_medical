import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  unoptimized?: boolean;
  sizes?: string;
}

export default function Image({ fill, unoptimized, sizes, ...props }: ImageProps) {
  return <img {...props} />;
}
