"use client";

import { useEffect, useRef, useState } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs"; // required to register backend

export default function Home() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Load MobileNet model on component mount
    const loadModel = async () => {
      const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 });
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      if (imageRef.current) {
        imageRef.current.src = reader.result as string;

        // Wait until image loads before prediction
        imageRef.current.onload = async () => {
          if (model && imageRef.current) {
            const results = await model.classify(imageRef.current);
            setPredictions(results.map((r) => `${r.className} (${(r.probability * 100).toFixed(2)}%)`));
          }
        };
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <main className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">Recycling Advisor</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
      <div>
        <img ref={imageRef} alt="Uploaded preview" className="mx-auto w-64 h-64 object-contain border" />
      </div>
      <div className="mt-4">
        <h2 className="font-semibold text-lg">Prediction:</h2>
        <ul>
          {predictions.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
