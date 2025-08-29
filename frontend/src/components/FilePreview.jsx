import React from 'react';

export default function FilePreview({ file }) {
  const isImg = file.mime?.startsWith('image');
  if (isImg) return <img src={file.url} alt={file.name} className="max-w-xs rounded" />;
  return (
    <div className="p-2 border rounded">
      <div className="font-medium">{file.name}</div>
      <div className="text-xs text-gray-500">{Math.round((file.size||0)/1024)} KB</div>
      <a className="text-sm text-primary" href={file.url} target="_blank">Download</a>
    </div>
  );
}
