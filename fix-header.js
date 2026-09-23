const fs = require('fs');
const p = 'app/admin/products/[id]/edit/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const target = `import { useEffect, useRef, useState } from "react";
  const fileRef = useRef<HTMLInputElement>(null);`;

const replacement = `import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync(p, c);
  console.log('Fixed export function');
} else {
  console.log('Could not find target content');
}
