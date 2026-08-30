import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

interface LearnCard {
  id: string;
  icon: string;
  title: string;
  summary: string;
  content: string;
}

const LEARN_CARDS: LearnCard[] = [
  {
    id: 'mrp',
    icon: '🏷️',
    title: 'What is MRP?',
    summary: 'Maximum Retail Price — the highest price a product can be sold for.',
    content:
      'MRP stands for Maximum Retail Price. It is the highest price at which a product can be sold to a consumer. No seller — whether a big store or a small shop — can charge more than the MRP printed on the package. The MRP includes all taxes and must be clearly printed on every pre-packaged product. You do not need to bargain below the MRP.',
  },
  {
    id: 'net-quantity',
    icon: '⚖️',
    title: 'What is Net Quantity?',
    summary: 'The actual amount of product inside the package.',
    content:
      'Net quantity tells you how much product is actually inside the package — for example, "1 L" or "500 g". It must be clearly stated on the package. If a product claims to contain 1 kilogram but actually contains less, this could indicate a short-fill issue. You have the right to receive the quantity that is stated on the package.',
  },
  {
    id: 'package-info',
    icon: '📋',
    title: 'What Package Information Must Appear?',
    summary: 'Basic mandatory details every consumer package must carry.',
    content:
      'Every consumer package must carry certain mandatory information: the product name and description, the name and address of the manufacturer or packer, the net quantity (weight or volume), the MRP, the batch or lot number, the date of manufacturing and expiry (where applicable), and the country of origin. For imported products, the importer\'s details must also be included.',
  },
  {
    id: 'screening',
    icon: '🔍',
    title: 'How Package Screening Works',
    summary: 'An automated check that looks at the package image you submit.',
    content:
      'When you scan a product package, the system looks at the image you provide and tries to read the printed information from it. It checks whether key details — like MRP, net quantity, manufacturer name, and expiry date — appear to be present. The system gives you a preliminary result: no issue detected, review recommended, or potential issue detected. This is only a first check, not a final determination.',
  },
  {
    id: 'complaint-submit',
    icon: '📝',
    title: 'How to Submit a Complaint',
    summary: 'Steps to file a complaint about a product concern.',
    content:
      'To submit a complaint, go to "My Complaints" and click "New Complaint". Fill in the product name, where you bought it, the purchase date, and describe the issue. Upload photos of the product package and any supporting documents, such as a bill or receipt. Submit the complaint and you will receive a complaint ID. You can use this ID to track the status of your complaint at any time.',
  },
  {
    id: 'after-complaint',
    icon: '🔄',
    title: 'What Happens After You Submit?',
    summary: 'How your complaint is reviewed and resolved.',
    content:
      'Once submitted, your complaint is reviewed and assigned to an officer. The officer may schedule a physical inspection of the product. After inspection and verification, a determination is made. You will receive updates as the complaint progresses through stages: Received → Assigned → Inspection → Verification → Resolved. You can track the status in the "My Complaints" section of your account.',
  },
  {
    id: 'clear-image',
    icon: '📷',
    title: 'How to Capture a Clear Package Image',
    summary: 'Tips for taking good photos that can be read by the system.',
    content:
      'Good photos help the system read package information more accurately. Place the package in a well-lit area — natural daylight works well. Hold the camera steady and close enough so the printed text is legible. Try to keep the package flat and fill the frame with it. Avoid blurry photos, strong shadows, or reflections on the packaging. If the text is too small to read in the photo, the system may not be able to detect all the information.',
  },
];

const ExpandedCard: React.FC<{ card: LearnCard; onClose: () => void }> = ({ card, onClose }) => (
  <div className="cit-learn__expanded">
    <div className="cit-learn__expanded-header">
      <div className="cit-learn__expanded-icon">{card.icon}</div>
      <div>
        <h2 className="cit-learn__expanded-title">{card.title}</h2>
        <p className="cit-learn__expanded-summary">{card.summary}</p>
      </div>
    </div>
    <p className="cit-learn__expanded-body">{card.content}</p>
    <div className="cit-learn__expanded-footer">
      <Button variant="outline" onClick={onClose}>
        ← Back to All Topics
      </Button>
    </div>
  </div>
);

export const CitizenLearn: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expandedCard = expandedId ? LEARN_CARDS.find(c => c.id === expandedId) : null;

  const handleOpen = useCallback((id: string) => {
    setExpandedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClose = useCallback(() => {
    setExpandedId(null);
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  return (
    <div className="cit-learn">
      <div className="cit-learn__container">
        <header className="cit-learn__header">
          <h1 className="cit-learn__title">Learn</h1>
          <p className="cit-learn__subtitle">
            Consumer-friendly information about your rights and how the platform works.
          </p>
        </header>

        {expandedCard ? (
          <ExpandedCard card={expandedCard} onClose={handleClose} />
        ) : (
          <>
            <div className="cit-learn__grid">
              {LEARN_CARDS.map(card => (
                <button
                  key={card.id}
                  className="cit-learn__card"
                  onClick={() => handleOpen(card.id)}
                  aria-label={`Learn about: ${card.title}`}
                >
                  <span className="cit-learn__card-icon">{card.icon}</span>
                  <h2 className="cit-learn__card-title">{card.title}</h2>
                  <p className="cit-learn__card-summary">{card.summary}</p>
                  <span className="cit-learn__card-cta">Read more →</span>
                </button>
              ))}
            </div>

            <div className="cit-learn__disclaimer">
              <span>ℹ️</span>
              <p>
                This information is provided for general educational purposes. It does not
                constitute legal advice. For specific legal matters, please consult an
                authorized legal professional.
              </p>
            </div>
          </>
        )}

        <div className="cit-learn__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenLearnStyles />
    </div>
  );
};

const CitizenLearnStyles: React.FC = () => (
  <style>{`
    .cit-learn {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-learn__container {
      max-width: 960px;
      margin: 0 auto;
    }

    .cit-learn__header {
      margin-bottom: var(--space-6);
    }

    .cit-learn__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-learn__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-learn__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .cit-learn__card {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-base);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      font-family: inherit;
    }

    .cit-learn__card:hover {
      border-color: var(--color-navy-500);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .cit-learn__card:focus-visible {
      outline: 2px solid var(--color-navy-500);
      outline-offset: 2px;
    }

    .cit-learn__card-icon {
      font-size: 2rem;
      line-height: 1;
    }

    .cit-learn__card-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0;
    }

    .cit-learn__card-summary {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
      line-height: 1.5;
      flex: 1;
    }

    .cit-learn__card-cta {
      font-size: var(--font-size-sm);
      color: var(--color-navy-600);
      font-weight: var(--font-weight-medium);
      margin-top: var(--space-1);
    }

    .cit-learn__disclaimer {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--color-navy-50);
      border: 1px solid var(--color-navy-100);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-6);
    }

    .cit-learn__disclaimer p {
      font-size: var(--font-size-xs);
      color: var(--color-navy-700);
      margin: 0;
      line-height: 1.6;
    }

    /* Expanded card */
    .cit-learn__expanded {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-md);
    }

    .cit-learn__expanded-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }

    .cit-learn__expanded-icon {
      font-size: 3rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .cit-learn__expanded-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-2) 0;
    }

    .cit-learn__expanded-summary {
      font-size: var(--font-size-base);
      color: var(--color-gray-600);
      margin: 0;
      font-style: italic;
    }

    .cit-learn__expanded-body {
      font-size: var(--font-size-base);
      color: var(--color-gray-700);
      line-height: 1.8;
      margin: 0 0 var(--space-6) 0;
    }

    .cit-learn__expanded-footer {
      border-top: 1px solid var(--color-gray-100);
      padding-top: var(--space-5);
    }

    .cit-learn__back-row {
      text-align: center;
      margin-top: var(--space-4);
    }

    @media (max-width: 768px) {
      .cit-learn {
        padding: var(--space-4);
      }

      .cit-learn__grid {
        grid-template-columns: 1fr;
      }

      .cit-learn__expanded {
        padding: var(--space-5);
      }

      .cit-learn__expanded-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `}</style>
);

export default CitizenLearn;
