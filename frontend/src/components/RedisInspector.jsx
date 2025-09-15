// import { useState } from 'react'

// function RedisInspector() {
//   const [redisData, setRedisData] = useState(null)
//   const [loading, setLoading] = useState(false)

//   async function fetchRedisData() {
//     setLoading(true)
//     try {
//       const response = await fetch('http://localhost:5001/api/debug/redis')
//       const data = await response.json()
//       setRedisData(data)
//     } catch (error) {
//       console.error('Failed to fetch Redis data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="redis-container">
//       <div className="redis-header">
//         <h3>Redis Data Inspector</h3>
//         <button 
//           onClick={fetchRedisData} 
//           className="refresh-btn"
//           disabled={loading}
//         >
//           {loading ? '⏳' : '🔄'} Refresh
//         </button>
//       </div>
      
//       {redisData ? (
//         <div className="redis-data">
//           <div className="redis-summary">
//             <div className="summary-item">
//               <span className="label">Total Keys:</span>
//               <span className="value">{redisData.keys?.length || 0}</span>
//             </div>
//             <div className="summary-item">
//               <span className="label">Session Keys:</span>
//               <span className="value">
//                 {redisData.keys?.filter(k => k.startsWith('session:')).length || 0}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span className="label">Cache Keys:</span>
//               <span className="value">
//                 {redisData.keys?.filter(k => k.startsWith('answer:') || k.startsWith('qvec:') || k.startsWith('ctx:')).length || 0}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span className="label">Answer Cache:</span>
//               <span className="value">
//                 {redisData.keys?.filter(k => k.startsWith('answer:')).length || 0}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span className="label">Query Vectors:</span>
//               <span className="value">
//                 {redisData.keys?.filter(k => k.startsWith('qvec:')).length || 0}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span className="label">Context Cache:</span>
//               <span className="value">
//                 {redisData.keys?.filter(k => k.startsWith('ctx:')).length || 0}
//               </span>
//             </div>
//           </div>
          
//           <div className="redis-keys">
//             {redisData.keys?.map(key => (
//               <div key={key} className="redis-key">
//                 <div className="key-header">
//                   <span className="key-name">{key}</span>
//                   <span className="key-type">{typeof redisData.data[key]}</span>
//                 </div>
//                 <div className="key-content">
//                   <pre>{JSON.stringify(redisData.data[key], null, 2)}</pre>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="redis-empty">
//           <div className="empty__icon">🗄️</div>
//           <h3>Redis Data Inspector</h3>
//           <p>Click "Refresh" to load Redis data and see what's stored in memory.</p>
//           <button onClick={fetchRedisData} className="refresh-btn">
//             🔄 Load Redis Data
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default RedisInspector