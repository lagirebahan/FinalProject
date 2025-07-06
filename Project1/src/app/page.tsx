"use client";

import { useEffect, useRef, useState } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

interface Prediction {
  className: string;
  probability: number;
}

export default function Home() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [disposalInstruction, setDisposalInstruction] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Please select an image under 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      setAiRecommendation("");
      setDisposalInstruction("");

      if (imageRef.current) {
        imageRef.current.src = imageUrl;

        imageRef.current.onload = async () => {
          if (model && imageRef.current) {
            setIsLoading(true);
            try {
              const results = await model.classify(imageRef.current);
              setPredictions(results);

              const label = results[0].className.toLowerCase();
              let hasOrganic = false;
              let hasInorganicRecyclable = false;
              let hasInorganicNonRecyclable = false;

              if (
                label.includes("banana") ||
                label.includes("apple") ||
                label.includes("food") ||
                label.includes("fruit") ||
                label.includes("orange")
              ) {
                hasOrganic = true;
              }
              if (
                label.includes("plastic") ||
                label.includes("bottle") ||
                label.includes("can") ||
                label.includes("metal") ||
                label.includes("paper") ||
                label.includes("cardboard") ||
                label.includes("box") ||
                label.includes("newspaper") ||
                label.includes("envelope") ||
                label.includes("plastic bag") ||
                label.includes("umbrella")
              ) {
                hasInorganicRecyclable = true;
              }
              if (
                label.includes("styrofoam") ||
                label.includes("diaper") ||
                label.includes("cigarette") ||
                label.includes("ashtray")
              ) {
                hasInorganicNonRecyclable = true;
              }

              let typeDesc: string[] = [];
              if (hasOrganic) typeDesc.push("sampah organik (misalnya sisa makanan)");
              if (hasInorganicRecyclable) typeDesc.push("sampah anorganik yang dapat didaur ulang (misalnya plastik atau kertas)");
              if (hasInorganicNonRecyclable) typeDesc.push("sampah yang tidak dapat didaur ulang (misalnya styrofoam)");

              let recommendation = "";
              if (hasOrganic && hasInorganicRecyclable) {
                recommendation = "Pisahkan: komposkan bagian organik dan daur ulang bagian anorganik.";
              } else if (hasOrganic) {
                recommendation = "Komposkan sampah organik jika memungkinkan.";
              } else if (hasInorganicRecyclable) {
                recommendation = "Masukkan ke tempat daur ulang atau bawa ke bank sampah terdekat.";
              } else if (hasInorganicNonRecyclable) {
                recommendation = "Buang sampah ini ke tempat sampah biasa karena tidak dapat didaur ulang.";
              } else {
                recommendation = "Jenis sampah tidak dikenali. Mohon coba gambar lain.";
              }

              const finalMessage = typeDesc.length > 0 ? `Gambar ini tampaknya mengandung ${typeDesc.join(" dan ")}. Disarankan untuk: ${recommendation}`: recommendation;
              setAiRecommendation(finalMessage);

              let disposal = "";
              if (hasOrganic && hasInorganicRecyclable) {
                disposal = "Pisahkan sampah organik dan anorganik. Komposkan sisa makanan dan daur ulang item seperti plastik dan kertas.";
              } else if (hasOrganic) {
                disposal = "Buang ke tempat kompos atau gunakan komposter rumah untuk sisa makanan.";
              } else if (hasInorganicRecyclable) {
                disposal = "Masukkan ke tempat daur ulang atau bawa ke bank sampah terdekat.";
              } else if (hasInorganicNonRecyclable) {
                disposal = "Buang ke tempat sampah biasa. Hindari mencampur dengan sampah lain.";
              } else {
                disposal = "Jenis sampah tidak dikenali. Mohon coba gambar lain.";
              }
              setDisposalInstruction(disposal);
            } catch (error) {
              console.error("Error classifying image:", error);
            } finally {
              setIsLoading(false);
            }
          }
        };
      }
    };

    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setPredictions([]);
    setAiRecommendation("");
    setDisposalInstruction("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🌱 Recycling Advisor</h1>
          <p className="text-gray-600 text-lg">Upload foto item untuk mendapatkan identifikasi AI</p>
          {!model && !isLoading && (
            <p className="text-orange-600 mt-2">⚠️ Model sedang dimuat...</p>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors font-medium"
            >
              📷 Pilih Gambar
            </label>
            {imagePreview && (
              <button
                onClick={clearImage}
                className="ml-4 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ Hapus
              </button>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-6 text-center">
              <img
                ref={imageRef}
                src={imagePreview}
                alt="Preview"
                className="mx-auto max-w-md max-h-64 object-contain rounded-lg shadow-md border"
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                Menganalisis gambar...
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {predictions.length > 0 && !isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              🔍 Hasil Deteksi AI
            </h2>
            <div className="space-y-3">
              {predictions.slice(0, 5).map((prediction, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    index === 0 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {prediction.className}
                    </span>
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {aiRecommendation && (
              <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md text-green-800">
                <p className="font-semibold">♻️ Saran Pembuangan:</p>
                <p>{aiRecommendation}</p>
              </div>
            )}

            {disposalInstruction && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-yellow-800">
                <p className="font-semibold">🗑️ Cara Membuang:</p>
                <p>{disposalInstruction}</p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {predictions.length === 0 && !isLoading && model && (
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold text-blue-800 mb-2">🤖 Cara Menggunakan</h3>
            <div className="text-blue-700 space-y-2">
              <p>1. Klik tombol "Pilih Gambar" untuk upload foto item</p>
              <p>2. AI akan mengidentifikasi jenis item tersebut</p>
              <p>3. Dapatkan hasil klasifikasi dengan tingkat akurasi</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
