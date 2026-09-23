const fs = require('fs');
let p1 = 'app/admin/products/[id]/edit/page.tsx';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace('type SpecGroup = { groupName: string; items: SpecItem[] };', 'type SpecGroup = { groupName: string; items: SpecItem[] };\ntype ReviewItem = { name: string; rate: string; comment: string; date: string };');
c1 = c1.replace('const [categories, setCategories] = useState<SubCat[]>([]);', 'const [categories, setCategories] = useState<SubCat[]>([]);\n  const [reviews, setReviews] = useState<ReviewItem[]>([]);');
fs.writeFileSync(p1, c1);

let p2 = 'app/admin/products/new/page.tsx';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace('type SpecGroup = { groupName: string; items: SpecItem[] };', 'type SpecGroup = { groupName: string; items: SpecItem[] };\ntype ReviewItem = { name: string; rate: string; comment: string; date: string };');
c2 = c2.replace('const [categories, setCategories] = useState<SubCat[]>([]);', 'const [categories, setCategories] = useState<SubCat[]>([]);\n  const [reviews, setReviews] = useState<ReviewItem[]>([]);');
fs.writeFileSync(p2, c2);
console.log('Fixed types and states');
