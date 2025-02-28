import React from 'react';
import { Img } from 'react-image';
import ImageLinks from '../Assets';
import { Grid2 } from '@mui/material';

interface EnhancedProductImageProps {
  ImageSource: string;
  AlternateText?: string;
  Dimensions?: { Height?: number; Width?: number };
  CustomClasses?: string;
  Layout?: "FIXED" | "INTRINSIC" | "RESPONSIVE" | "FILL";
  Priority?: boolean;
  Placeholder?: "blur" | "empty";
  BlurDataURL?: string;
}

const ProductImage: React.FC<EnhancedProductImageProps> = ({
  ImageSource,
  AlternateText = "Image",
  Dimensions = { Height: 60, Width: 60 },
  CustomClasses = "",
  Layout = "INTRINSIC",
  Placeholder = "empty",
}) => {
  const { Height, Width } = Dimensions;

  return (
    <div className={`relative ${CustomClasses}`}>
      <Img
        src={ImageSource || ImageLinks?._LoadingScreen}
        alt={AlternateText}
        width={Width ?? 100}
        height={Height ?? 100}
        loader={<Grid2 className="loader"><Img src={ImageLinks?._LoadingScreen}/></Grid2>} 
        unloader={<Grid2 className="error">Error loading image</Grid2>} 
        style={{
          objectFit: "contain", 
          width: Layout === "RESPONSIVE" ? "100%" : `${Width ?? 100}px`,
          height: Layout === "RESPONSIVE" ? "auto" : `${Height ?? 100}px`,
        }}
        aria-placeholder={Placeholder === "blur" ? "blurred" : "empty"}
        className="object-contain"
      />
    </div>
  );
};

export default ProductImage;
