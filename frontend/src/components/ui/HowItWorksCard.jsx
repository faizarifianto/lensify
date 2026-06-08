import React from 'react';
import styled from 'styled-components';

const HowItWorksCard = ({ icon, title, desc }) => {
  return (
    <StyledWrapper className="w-full flex justify-center">
      <div className="card-container">
        {/* Background layers - real divs instead of pseudo-elements */}
        <div className="layer layer-back" />
        <div className="layer layer-mid" />
        {/* Main card */}
        <div className="content">
          <span className="material-symbols-outlined text-5xl mb-1">{icon}</span>
          <h4 className="font-display font-bold text-xl tracking-tight m-0">{title}</h4>
          <p className="para m-0 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card-container {
    position: relative;
    width: 100%;
    min-height: 280px;
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .layer {
    position: absolute;
    border-radius: 22px;
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .layer-back {
    top: -8%;
    left: 50%;
    width: 80%;
    height: 80%;
    transform: translateX(-50%);
    background: #ffb88c;
    box-shadow: 0 4px 15px rgba(255, 184, 140, 0.4);
  }

  .layer-mid {
    top: -4%;
    left: 50%;
    width: 90%;
    height: 90%;
    transform: translateX(-50%);
    background: #ff8c42;
    box-shadow: 0 6px 20px rgba(255, 140, 66, 0.35);
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 36px;
    border-radius: 22px;
    color: #ffffff;
    overflow: hidden;
    background: #ff6a00;
    width: 100%;
    min-height: 280px;
    text-align: left;
    box-shadow: 0 10px 30px rgba(255, 106, 0, 0.25);
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .content .para {
    opacity: 0.9;
    font-size: 15px;
  }

  .card-container:hover {
    transform: translateY(-16px);
  }

  .card-container:hover .layer-mid {
    transform: translateX(-50%) rotate(-8deg);
    top: 0;
    width: 100%;
    height: 100%;
  }

  .card-container:hover .layer-back {
    transform: translateX(-50%) rotate(8deg);
    top: 0;
    width: 100%;
    height: 100%;
  }
`;

export default HowItWorksCard;
