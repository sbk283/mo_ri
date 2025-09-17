import regions from '../data/regions.json';
import { useState } from 'react';

function RegionSelect() {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');

  const sigunguList = regions.find(r => r.sido === sido)?.sigungu || [];

  return (
    <div className="flex gap-2">
      <select value={sido} onChange={e => setSido(e.target.value)}>
        <option>시·도 선택</option>
        {regions.map(r => (
          <option key={r.sido}>{r.sido}</option>
        ))}
      </select>

      <select value={sigungu} onChange={e => setSigungu(e.target.value)} disabled={!sido}>
        <option>시·군·구 선택</option>
        {sigunguList.map(sg => (
          <option key={sg}>{sg}</option>
        ))}
      </select>
    </div>
  );
}

export default RegionSelect;
