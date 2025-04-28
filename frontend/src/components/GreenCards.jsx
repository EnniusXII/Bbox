import React from 'react';

export const GreenCards = ({
  greenCards = [],
  onGenerateNFT,
  nftLoading,
  onViewNFT,
  nftImages,
}) => {
  return (
    <div className='container flex flex-column'>
      <h2>Green Cards</h2>
      {greenCards.length > 0 ? (
        greenCards.map((card) => (
          <div className='card' key={card._id}>
            <p>Reference ID: {card.referenceId}</p>
            <p>Insured: {card.insured?.name}</p>
            <p>Address: {card.insured?.address}</p>
            <p>Registration Number: {card.vehicle?.registrationNumber}</p>
            <p>Category: {card.vehicle?.category}</p>
            <p>Company: {card.insurance?.companyName}</p>
            <p>
              Valid: {card.validity?.from.split('T')[0]} -{' '}
              {card.validity?.to.split('T')[0]}
            </p>
            <div>
              <p>Countries Covered:</p>
              {card.countriesCovered?.length > 0 ? (
                <ul>
                  {card.countriesCovered.map((country, index) => (
                    <li key={index}>{country || 'Unknown'}</li>
                  ))}
                </ul>
              ) : (
                <p>No countries listed.</p>
              )}
            </div>
            <div className="nft-actions flex flex-column">
              {card.nftMetadataUrl ? (
                <>
                  <button
                    onClick={() => onViewNFT(card._id, card.nftMetadataUrl)}
                  >
                    View NFT
                  </button>
                  {nftImages && nftImages[card._id] && (
                    <img
                      src={nftImages[card._id]}
                      alt="Green Card NFT"
                      style={{ width: "200px", marginTop: "10px" }}
                    />
                  )}
                </>
              ) : (
                <button
                  onClick={() => onGenerateNFT(card._id)}
                  disabled={nftLoading === card._id}
                >
                  {nftLoading === card._id
                    ? "Generating NFT..."
                    : "Create Green Card NFT"}
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No Green Cards found.</p>
      )}
    </div>
  );
};
