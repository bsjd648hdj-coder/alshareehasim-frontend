'use client';

import Script from 'next/script';

export default function SnapPixel() {
  return (
    <Script
      id="snap-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init', '7a18ca99-d7f5-4d7f-8229-6e661c814dc7', {});
snaptr('init', '4ceef06d-9161-4068-b281-c4ec5fb50d38', {});
// A general track call sends to every initialized pixel.
snaptr('track', 'PAGE_VIEW');`,
      }}
    />
  );
}
