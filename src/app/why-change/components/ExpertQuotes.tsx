'use client';

interface Quote {
  quote: string;
  source: string;
}

interface ExpertQuotesProps {
  quotes: Quote[];
}

export default function ExpertQuotes({ quotes }: ExpertQuotesProps) {
  return (
    <div className="bg-gradient-to-r from-primary-purple to-primary-blue rounded-2xl p-8 text-white">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">ماذا يقول الخبراء؟</h2>
        <p className="text-white/80">
          استشرنا أكبر النماذج الذكية في العالم عن التقنيات المستخدمة
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {quotes.map((item, index) => (
          <div 
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors"
          >
            <div className="text-5xl mb-4">&ldquo;</div>
            <p className="text-lg font-medium mb-4 leading-relaxed">
              {item.quote}
            </p>
            <p className="text-white/70 text-sm">— {item.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
