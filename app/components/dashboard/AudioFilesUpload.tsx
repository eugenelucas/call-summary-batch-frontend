"use client";
import React, { useState, ChangeEvent, DragEvent } from "react";
import { Upload, File, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

// Type definitions
interface SuccessResponse {
  filename: string;
  url: string;
  message: string;
}

interface ErrorResponse {
  detail: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

const AudioFilesUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [response, setResponse] = useState<SuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith("audio/")) {
        setFile(selectedFile);
        setError(null);
        setResponse(null);
      } else {
        setError("Please select a valid audio file.");
        setFile(null);
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      setFile(droppedFile);
      setError(null);
      setResponse(null);
    } else {
      setError("Please drop a valid audio file.");
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const uploadFile = async (): Promise<void> => {
    if (!file) {
      setError("Please select an audio file.");
      return;
    }

    setUploading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/upload-audio/",
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          body: formData,
        }
      );

      const data: ApiResponse = await res.json();

      if (res.ok) {
        setResponse(data as SuccessResponse);
      } else {
        const errorData = data as ErrorResponse;
        setError(errorData.detail || "Upload failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError("Network error: " + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = (): void => {
    setFile(null);
    setResponse(null);
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes: string[] = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold ot-title">Upload Audio File</h2>
        <p className="font-sm osubtitle">Upload your audio file for processing</p>
      </div>

      {/* File Upload Area */}
      {!response && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
          >
            <Image
              src="/browseafile-audio.svg"
              alt="Browse files"
              width={188}
              height={81}
              className="max-w-md m-auto mb-6"
            />
            <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer transition-colors">
              <span>Browse Files</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2 osubtitle">
              Supported formats: MP3, WAV, M4A, OGG, FLAC
            </p>
          </div>
          <div className="pt-6 rounded-lg">
            {!file && !response && (
              <div className="flex justify-end space-x-4">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadFile}
                  disabled={uploading}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {file && !response && (
        <div className="rounded-lg mb-4">
          <div className="self-start flex justify-between bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer mb-4">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium ot-title">{file.name}</p>
                <p className="text-sm text-left osubtitle">
                  {formatFileSize(file.size)} • {file.type}
                </p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="text-gray-500 hover:text-red-500 text-sm"
              type="button"
            >
              <svg
                width="26"
                height="20"
                viewBox="0 0 26 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5859 2C18.0042 2 21.5859 5.58172 21.5859 10C21.5859 14.4183 18.0042 18 13.5859 18C9.16766 18 5.58594 14.4183 5.58594 10C5.58594 5.58172 9.16766 2 13.5859 2ZM13.5859 3C9.71994 3 6.58594 6.13401 6.58594 10C6.58594 13.866 9.71994 17 13.5859 17C17.4519 17 20.5859 13.866 20.5859 10C20.5859 6.13401 17.4519 3 13.5859 3ZM11.3954 7.11372L11.4646 7.17157L13.5859 9.29289L15.7073 7.17157C15.8808 6.99801 16.1502 6.97872 16.3451 7.11372L16.4144 7.17157C16.5879 7.34514 16.6072 7.61456 16.4722 7.80943L16.4144 7.87868L14.293 10L16.4144 12.1213C16.5879 12.2949 16.6072 12.5643 16.4722 12.7592L16.4144 12.8284C16.2408 13.002 15.9714 13.0213 15.7765 12.8863L15.7073 12.8284L13.5859 10.7071L11.4646 12.8284C11.2911 13.002 11.0216 13.0213 10.8268 12.8863L10.7575 12.8284C10.5839 12.6549 10.5647 12.3854 10.6997 12.1906L10.7575 12.1213L12.8788 10L10.7575 7.87868C10.5839 7.70511 10.5647 7.43569 10.6997 7.24082L10.7575 7.17157C10.9311 6.99801 11.2005 6.97872 11.3954 7.11372Z"
                  fill="#8180AA"
                />
              </svg>
            </button>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={uploadFile}
              disabled={uploading}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Response */}
      {response && (
        <div className="bg-white border border-gray-200 rounded-lg p-10 mb-4 text-center">
          <div>
            <Image
              src="/Uploadfile-Successfully.svg"
              alt="Upload successful"
              width={260}
              height={197}
              className="max-w-md m-auto"
            />
            <h3 className="font-medium text-center font-bold ot-title text-2xl">
              Upload Successful!
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-center osubtitle">
              <span className="font-medium osubtitle">Filename:</span>
              <span className="osubtitle ml-2">{response.filename}</span>
            </div>
            <div className="text-center osubtitle">
              <span className="font-medium osubtitle">URL:</span>
              <a
                href={response.url}
                target="_blank"
                rel="noopener noreferrer"
                className="osubtitle hover:text-blue-800 underline ml-2 break-all"
              >
                File Link
              </a>
            </div>
            <div className="text-center osubtitle">
              <span className="font-medium osubtitle">Message:</span>
              <span className="osubtitle ml-2">{response.message}</span>
            </div>
          </div>
          <button
            onClick={resetUpload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors m-auto"
            type="button"
          >
            Upload Another File
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Upload Failed</h3>
              <p className="text-red-700 text-left text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            type="button"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioFilesUploadComponent;