import React from 'react';
import styled from 'styled-components';

const FlipCard = ({ title, desc, rentedCount, img }) => {
  return (
    <StyledWrapper>
      <div className="flip-card group cursor-pointer w-full">
        <div className="flip-card-inner w-full">
          <div 
            className="flip-card-front items-center justify-center flex flex-col h-full relative overflow-hidden rounded-[1rem]"
            style={{ backgroundColor: img ? '#EE5F03' : '#111111' }}
          >
            {img && <img src={img.startsWith('http') ? img : img} alt={title} className="absolute inset-0 w-full h-full object-contain z-10" />}
            
            <div className="flex-grow flex flex-col items-center justify-end relative z-20 w-full pb-6">
              <p className="font-display font-bold text-2xl mb-1 leading-none text-white px-4 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{title}</p>
            </div>
          </div>
          <div className="flip-card-back p-6 items-center justify-center">
            <p className="font-display font-bold text-xl mb-4">{title}</p>
            <p className="text-sm mb-6 leading-relaxed opacity-90">{desc}</p>
            <div className="flex items-center gap-2 mt-auto text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Telah disewa {rentedCount} kali</span>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  
  .flip-card {
    background-color: transparent;
    width: 100%;
    aspect-ratio: 3 / 4;
    perspective: 1000px;
    font-family: inherit;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    box-shadow: 0 8px 14px 0 rgba(0,0,0,0.1);
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border: 1px solid coral;
    border-radius: 1rem;
  }

  .flip-card-front {
    color: white;
  }

  .flip-card-back {
    background: linear-gradient(120deg, rgb(255, 174, 145) 30%, coral 88%,
       bisque 40%, rgb(255, 185, 160) 78%);
    color: white;
    transform: rotateY(180deg);
  }
`;

export default FlipCard;
