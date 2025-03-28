import FeedbackForm from '../../components/FeedbackForm';

export const metadata = {
  title: 'Islamic Trivia THR App Feedback',
  description: 'Berikan feedback untuk aplikasi Islamic Trivia THR'
};

export default function THRAppFeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FeedbackForm
        formType="THR-APP"
        title="Kuisioner Pengalaman Penggunaan Aplikasi Islamic Trivia THR"
        subtitle="Terima kasih telah mencoba aplikasi Islamic Trivia THR! Kami ingin mendengar pendapatmu untuk membantu kami meningkatkan pengalaman pengguna. Silakan isi kuisioner ini setelah mencoba aplikasi."
      />
    </div>
  );
} 