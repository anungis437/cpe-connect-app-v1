export default function TestHomepage() {
  console.log('🧪 TestHomepage rendering')
  
  return (
    <div>
      <div className="bg-red-500 text-white p-8 text-center text-3xl font-bold">
        🧪 TEST HOMEPAGE - If you can see this, basic rendering works
      </div>
      <div className="bg-blue-500 text-white p-8 text-center text-3xl font-bold">
        🧪 SECOND ELEMENT - This should also be visible
      </div>
    </div>
  )
}