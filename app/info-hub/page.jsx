'use client';

import { useState } from 'react';
import AppShell from '../../components/AppShell.jsx';

export default function InfoHubPage() {
  const [expandedUnits, setExpandedUnits] = useState([]);

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const units = [
    { id: 1, name: 'Number Systems', marks: 6, chapters: ['Real Numbers'] },
    { id: 2, name: 'Algebra', marks: 20, chapters: ['Polynomials', 'Pair of Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions'] },
    { id: 3, name: 'Coordinate Geometry', marks: 6, chapters: ['Distance Formula', 'Section Formula'] },
    { id: 4, name: 'Geometry', marks: 15, chapters: ['Triangles', 'Circles'] },
    { id: 5, name: 'Trigonometry', marks: 12, chapters: ['Trigonometric Ratios', 'Trigonometric Identities', 'Heights & Distances'] },
    { id: 6, name: 'Mensuration', marks: 10, chapters: ['Areas Related to Circles', 'Surface Areas & Volumes'] },
    { id: 7, name: 'Statistics & Probability', marks: 11, chapters: ['Statistics', 'Probability'] }
  ];

  const learningObjectives = [
    { topic: 'Real Numbers', points: ['Understand Fundamental Theorem of Arithmetic', 'Prove irrational numbers like √2, √3'] },
    { topic: 'Polynomials', points: ['Find zeros (graph + algebra)', 'Understand relation between zeros & coefficients'] },
    { topic: 'Linear Equations', points: ['Solve graphically and algebraically', 'Understand number of solutions'] },
    { topic: 'Quadratic Equations', points: ['Solve using factorization & formula', 'Identify nature of roots using discriminant'] },
    { topic: 'Arithmetic Progression (AP)', points: ['Find nth term', 'Find sum of n terms', 'Solve real-life problems'] },
    { topic: 'Coordinate Geometry', points: ['Use distance formula', 'Use section formula'] },
    { topic: 'Triangles', points: ['Understand similarity', 'Prove Basic Proportionality Theorem'] },
    { topic: 'Circles', points: ['Tangent ⟂ Radius', 'Equal tangents from external point'] },
    { topic: 'Trigonometry', points: ['Learn values of 30°, 45°, 60°', 'Use identities like sin²A + cos²A = 1'] },
    { topic: 'Heights & Distances', points: ['Solve real-world problems using trigonometry'] },
    { topic: 'Mensuration', points: ['Area of sector & segment', 'Surface area & volume of solids'] },
    { topic: 'Statistics', points: ['Mean, median, mode'] },
    { topic: 'Probability', points: ['Basic probability formulas', 'Solve simple real-life problems'] }
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 1. EXAM OVERVIEW */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">🎯 Exam Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-primary">80</div>
              <div className="text-sm text-muted">Total Marks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">⏱</div>
              <div className="text-2xl font-bold text-green-600">3 Hours</div>
              <div className="text-sm text-muted">Duration</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg col-span-2 md:col-span-1">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-purple-600">CBSE Class 10</div>
              <div className="text-sm text-muted">Mathematics</div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <h3 className="font-semibold text-orange-700 mb-3">🔥 High Weight Units (Focus More)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-orange-600">20</div>
                <div className="text-sm text-muted">Algebra</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-orange-600">15</div>
                <div className="text-sm text-muted">Geometry</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-orange-600">12</div>
                <div className="text-sm text-muted">Trigonometry</div>
              </div>
            </div>
            <p className="text-sm text-orange-600 mt-3 font-medium">These 3 units cover almost 60% of your exam</p>
          </div>
        </div>

        {/* 2. UNIT-WISE WEIGHTAGE */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">📊 Unit-wise Weightage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {units.map((unit) => (
              <div 
                key={unit.id} 
                className={`p-4 rounded-lg border-2 ${
                  unit.marks >= 15 
                    ? 'border-red-300 bg-red-50' 
                    : unit.marks >= 10 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : 'border-green-300 bg-green-50'
                }`}
              >
                <div className="text-2xl font-bold text-heading mb-1">{unit.marks}</div>
                <div className="text-sm font-medium text-muted">{unit.name}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mt-4 text-center">👉 Start with Algebra → Geometry → Trigonometry</p>
        </div>

        {/* 3. CHAPTER BREAKDOWN */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">📚 Chapter Breakdown</h2>
          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleUnit(unit.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{expandedUnits.includes(unit.id) ? '▼' : '▶'}</span>
                    <span className="font-semibold text-heading">{unit.name}</span>
                  </div>
                  <span className="text-sm text-muted">{unit.chapters.length} chapters</span>
                </div>
                {expandedUnits.includes(unit.id) && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="space-y-2">
                      {unit.chapters.map((chapter, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 text-sm">
                          <span>📖</span>
                          <span>{chapter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. WHAT YOU SHOULD LEARN */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">🧠 What You Should Learn</h2>
          <div className="space-y-4">
            {learningObjectives.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-heading mb-2">📌 {item.topic}</h3>
                <ul className="space-y-1">
                  {item.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600">✔</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 5. EXAM FOCUS */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">🎯 Exam Focus (Very Important)</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold text-red-600 mb-3">🔥 High Priority Chapters</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Quadratic Equations', 'Trigonometry', 'Triangles', 'Arithmetic Progression'].map((chapter, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg text-center font-medium text-red-700">
                  {chapter}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-yellow-600 mb-3">⚠ Common Mistakes</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Sign errors in equations', 'Wrong trigonometric values', 'Skipping steps in proofs', 'Calculation mistakes'].map((mistake, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                  {mistake}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-blue-600 mb-3">📄 Frequent Question Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Graph-based questions', 'Word problems', 'Proof-based questions', 'Formula application'].map((type, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. QUESTION PAPER PATTERN */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">📝 Question Paper Pattern</h2>
          <div className="space-y-4">
            {[
              { type: 'Understanding', percentage: 54, color: 'bg-blue-500' },
              { type: 'Application', percentage: 24, color: 'bg-green-500' },
              { type: 'Analysis', percentage: 22, color: 'bg-purple-500' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-heading">{item.type}</span>
                  <span className="font-bold text-primary">{item.percentage}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mt-4 text-center bg-gray-50 p-3 rounded-lg">
            👉 Most questions test concept clarity, not memorization
          </p>
        </div>

        {/* 7. STUDY STRATEGY */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-heading mb-4">🚀 Study Strategy</h2>
          <div className="space-y-3">
            {[
              'Start with Algebra (highest marks)',
              'Practice Trigonometry daily',
              'Focus on weak topics first',
              'Solve previous year questions',
              'Revise formulas every week'
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h3 className="font-semibold text-green-700 mb-2">💡 Final Tip</h3>
            <p className="text-sm text-green-600 mb-2">👉 Don't try to study everything at once</p>
            <p className="text-sm text-green-600 font-medium">✔ Focus on:</p>
            <ul className="text-sm text-green-600 mt-1 space-y-1">
              <li>• High weight chapters</li>
              <li>• Your weak areas</li>
              <li>• Daily consistent practice</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
