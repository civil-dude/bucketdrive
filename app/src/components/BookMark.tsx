import React, { useState } from "react";

interface BookMarkProps {
  text: string;
}

const BookMark = ({ text }: BookMarkProps) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="bookmark">
      <button onClick={openModal}>Open Modal</button>
      {showModal && (
        <div className="modal">
          <h2>{text}</h2>
          <button onClick={closeModal}>Close Modal</button>
        </div>
      )}
    </div>
  );
};

export default BookMark;