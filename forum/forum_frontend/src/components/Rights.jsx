import React, { useEffect, useState } from "react";

const rights = [
  {
    title: "Right to Equality",
    description:
      "Ensures equal treatment before law, prohibits discrimination on grounds of religion, race, caste, sex or place of birth.",
  },
  {
    title: "Right to Freedom",
    description:
      "Grants freedom of speech, expression, assembly, association, movement, residence, and profession.",
  },
  {
    title: "Right against Exploitation",
    description:
      "Prohibits forced labor, child labor, and human trafficking in any form.",
  },
  {
    title: "Right to Freedom of Religion",
    description:
      "Guarantees religious freedom and allows all individuals to practice, propagate and manage their religion.",
  },
  {
    title: "Cultural and Educational Rights",
    description:
      "Protects the rights of cultural, religious, and linguistic minorities to preserve their heritage and establish institutions.",
  },
  {
    title: "Right to Constitutional Remedies",
    description:
      "Allows individuals to approach the Supreme Court or High Courts to enforce fundamental rights through writs.",
  },
];

const Rights = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rights.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-200 to-gray-400 mt-15">
      <div className="max-w-3xl mx-auto text-center mb-5">
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-2">
          Know Your <span className="text-gray-800">Rights</span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          A quick overview of the six Fundamental Rights guaranteed by the Indian Constitution.
        </p>
      </div>

      <div className="relative bg-white rounded-3xl shadow-xl p-6 md:p-10 transition-all duration-700 ease-in-out max-w-2xl mx-auto">
        <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-4 text-center">
          {rights[index].title}
        </h3>
        <p className="text-gray-700 text-sm md:text-base text-center leading-relaxed">
          {rights[index].description}
        </p>

        {/* Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {rights.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === index ? "bg-red-600 scale-110" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rights;
