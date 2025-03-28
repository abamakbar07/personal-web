'use client';

import React, { useState } from 'react';

interface OptionProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const RadioOptions: React.FC<OptionProps> = ({ options, value, onChange, name }) => {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-4 w-4 text-blue-600"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
};

interface CheckboxOptionsProps {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  name: string;
}

const CheckboxOptions: React.FC<CheckboxOptionsProps> = ({ options, values, onChange, name }) => {
  const handleCheckboxChange = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            name={name}
            value={option}
            checked={values.includes(option)}
            onChange={() => handleCheckboxChange(option)}
            className="h-4 w-4 text-blue-600"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
};

interface FeedbackFormProps {
  formType: string;
  title: string;
  subtitle?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ formType, title, subtitle }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gameFrequency: '',
    accessExperience: '',
    accessDifficulties: [] as string[],
    gameUnderstanding: '',
    featureClarity: '',
    confusingFeatures: '',
    questionDifficulty: '',
    rewardSystem: '',
    rewardSuggestions: '',
    improvementSuggestions: '',
    errorFeedback: '',
    wouldRetry: '',
    otherDifficulty: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, formType }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="my-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Terima Kasih!</h2>
        <p className="text-green-700">Umpan balik Anda telah diterima. Kami menghargai masukan Anda.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">1. Identitas Pengguna</h2>
          
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 font-medium">
              Nama (opsional)
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="age" className="block mb-2 font-medium">
              Usia
            </label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <p className="block mb-2 font-medium">
              Seberapa sering kamu bermain game berbasis kuis/trivia?
            </p>
            <RadioOptions
              name="gameFrequency"
              options={['Sering | lebih dari 3x seminggu', 'Kadang-kadang | 1-2x seminggu', 'Jarang | sekali dalam sebulan atau lebih jarang', 'Tidak pernah']}
              value={formData.gameFrequency}
              onChange={(value) => handleChange('gameFrequency', value)}
            />
          </div>
        </section>

        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. Pengalaman Akses Aplikasi</h2>
          
          <div className="mb-4">
            <p className="block mb-2 font-medium">
              Bagaimana pengalamanmu dalam mengakses aplikasi ini?
            </p>
            <RadioOptions
              name="accessExperience"
              options={['Sangat mudah', 'Cukup mudah', 'Sedikit sulit', 'Sangat sulit']}
              value={formData.accessExperience}
              onChange={(value) => handleChange('accessExperience', value)}
            />
          </div>
          
          <div>
            <p className="block mb-2 font-medium">
              Jika mengalami kesulitan, apa yang menjadi kendala utamamu?
              (Boleh pilih lebih dari satu)
            </p>
            <CheckboxOptions
              name="accessDifficulties"
              options={['UI/UX kurang intuitif', 'Proses pendaftaran/login rumit', 'Sulit memahami cara masuk ke game', 'Masalah teknis (error, loading lama, dll.)']}
              values={formData.accessDifficulties}
              onChange={(values) => handleChange('accessDifficulties', values)}
            />
            <div className="mt-2">
              <label htmlFor="otherDifficulty" className="block mb-1 font-medium">
                Lainnya:
              </label>
              <input
                type="text"
                id="otherDifficulty"
                value={formData.otherDifficulty}
                onChange={(e) => {
                  handleChange('otherDifficulty', e.target.value);
                  if (e.target.value && !formData.accessDifficulties.includes('Lainnya')) {
                    handleChange('accessDifficulties', [...formData.accessDifficulties, 'Lainnya']);
                  } else if (!e.target.value && formData.accessDifficulties.includes('Lainnya')) {
                    handleChange('accessDifficulties', formData.accessDifficulties.filter(item => item !== 'Lainnya'));
                  }
                }}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </section>

        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">3. Pengalaman Bermain Game</h2>
          
          <div className="mb-4">
            <p className="block mb-2 font-medium">
              Seberapa mudah memahami cara bermain game ini?
            </p>
            <RadioOptions
              name="gameUnderstanding"
              options={['Sangat mudah', 'Cukup mudah', 'Sedikit sulit', 'Sangat sulit']}
              value={formData.gameUnderstanding}
              onChange={(value) => handleChange('gameUnderstanding', value)}
            />
          </div>
          
          <div className="mb-4">
            <p className="block mb-2 font-medium">
              Apakah fitur-fitur di dalam aplikasi ini jelas dan mudah digunakan?
            </p>
            <RadioOptions
              name="featureClarity"
              options={['Ya, semuanya jelas', 'Beberapa fitur masih membingungkan', 'Sulit memahami fitur yang ada']}
              value={formData.featureClarity}
              onChange={(value) => handleChange('featureClarity', value)}
            />
          </div>
          
          <div>
            <label htmlFor="confusingFeatures" className="block mb-2 font-medium">
              Jika ada fitur yang membingungkan, mohon sebutkan dan jelaskan:
            </label>
            <textarea
              id="confusingFeatures"
              value={formData.confusingFeatures}
              onChange={(e) => handleChange('confusingFeatures', e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </section>

        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">4. Feedback tentang Gameplay dan Reward</h2>
          
          <div className="mb-4">
            <p className="block mb-2 font-medium">
              Apakah jumlah pertanyaan dan tingkat kesulitannya sudah sesuai?
            </p>
            <RadioOptions
              name="questionDifficulty"
              options={['Sudah pas', 'Terlalu mudah', 'Terlalu sulit', 'Terlalu banyak pertanyaan', 'Terlalu sedikit pertanyaan']}
              value={formData.questionDifficulty}
              onChange={(value) => handleChange('questionDifficulty', value)}
            />
          </div>
          
          <div className="mb-4">
            <p className="block mb-2 font-medium">
              Bagaimana menurutmu tentang sistem hadiah THR dalam game ini?
            </p>
            <RadioOptions
              name="rewardSystem"
              options={['Sangat menarik', 'Cukup menarik', 'Kurang menarik', 'Tidak menarik']}
              value={formData.rewardSystem}
              onChange={(value) => handleChange('rewardSystem', value)}
            />
          </div>
          
          <div>
            <label htmlFor="rewardSuggestions" className="block mb-2 font-medium">
              Jika ada saran tentang sistem hadiah, silakan tuliskan:
            </label>
            <textarea
              id="rewardSuggestions"
              value={formData.rewardSuggestions}
              onChange={(e) => handleChange('rewardSuggestions', e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </section>

        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">5. Saran & Masukan</h2>
          
          <div className="mb-4">
            <label htmlFor="improvementSuggestions" className="block mb-2 font-medium">
              Menurutmu, fitur apa yang perlu ditambahkan atau diperbaiki dalam aplikasi ini?
            </label>
            <textarea
              id="improvementSuggestions"
              value={formData.improvementSuggestions}
              onChange={(e) => handleChange('improvementSuggestions', e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="errorFeedback" className="block mb-2 font-medium">
              Jika ada kendala atau error selama bermain, silakan ceritakan secara singkat:
            </label>
            <textarea
              id="errorFeedback"
              value={formData.errorFeedback}
              onChange={(e) => handleChange('errorFeedback', e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <p className="block mb-2 font-medium">
              Apakah kamu ingin mencoba aplikasi ini lagi di acara mendatang?
            </p>
            <RadioOptions
              name="wouldRetry"
              options={['Ya', 'Mungkin', 'Tidak']}
              value={formData.wouldRetry}
              onChange={(value) => handleChange('wouldRetry', value)}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {submitting ? 'Mengirim...' : 'Kirim Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm; 