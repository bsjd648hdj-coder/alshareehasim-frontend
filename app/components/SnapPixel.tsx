'use client';

import Script from 'next/script';

export default function SnapPixel() {
  return (
    <Script
      id="snap-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init', 'bf2da9e5-525b-45e8-a2af-76049cec5c56', {});
snaptr('track', 'PAGE_VIEW');`,
      }}
    />
  );
}
