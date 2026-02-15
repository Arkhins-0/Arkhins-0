'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { SettingsPanel } from '@/components/layout';
import { getAssetPath } from '@/lib/utils';
import hygieiaData from '@/data/hygieia.json';
import { 
  Heart, 
  Droplets, 
  Scan, 
  Ribbon,
  Shield,
  MessageCircle,
  Link2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Layers,
  Database,
  Lock,
  Cpu,
  Monitor,
  Server,
  Palette
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Icon mapping
const iconMap = {
  Heart,
  Droplets,
  Scan,
  Ribbon,
};

// Process models data
const models = hygieiaData.models.map(model => ({ ...model, icon: iconMap[model.icon as keyof typeof iconMap] }));

// Features data
const features = [
  { title: '5 AI Models', description: 'Specialized diagnostic and predictive models', icon: Cpu },
  { title: '96%+ Accuracy', description: 'Clinical-grade machine learning predictions', icon: CheckCircle },
  { title: 'Blockchain Verified', description: 'Every analysis cryptographically secured', icon: Link2 },
  { title: 'AI Health Assistant', description: 'Dr. Hygieia - Context-aware medical guidance', icon: MessageCircle },
  { title: 'Dark/Light Mode', description: 'Beautiful, accessible interface', icon: Palette },
  { title: 'Responsive Design', description: 'Seamless experience across all devices', icon: Monitor },
];

// Tech stack
const frontendTech = ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'TanStack Query', 'Zustand'];
const backendTech = ['Flask', 'SQLAlchemy', 'JWT', 'scikit-learn', 'TensorFlow', 'Google Derm Foundation'];

// Security layers
const securityLayers = [
  { title: 'Authentication', items: ['JWT Token-based auth', 'Bcrypt password hashing', 'Session management'] },
  { title: 'Authorization', items: ['Role-based access control', 'Admin/User separation', 'Resource ownership validation'] },
  { title: 'Data Protection', items: ['Input validation & sanitization', 'SQL injection prevention', 'XSS protection'] },
  { title: 'Blockchain', items: ['SHA-256 cryptographic hashing', 'Immutable audit trail', 'Chain integrity validation'] },
];

// Screenshots
const screenshots = [
  { 
    id: 'hero',
    src: getAssetPath('/hygieia/Hero-compressed.png'), 
    alt: 'Hero Section', 
    title: 'Landing Page',
    description: 'A welcoming, professional landing page that introduces users to Hygieia\'s capabilities with dynamic gradient backgrounds, clear value proposition, and quick access cards to all 5 diagnostic services.'
  },
  { 
    id: 'dashboard',
    src: getAssetPath('/hygieia/Dashboard-compressed.png'), 
    alt: 'Dashboard', 
    title: 'User Dashboard',
    description: 'Personalized dashboard providing quick access to all features, recent analyses, statistics, and activity timeline. Includes analysis quick cards for Heart Risk, Diabetes Risk, Skin Diagnosis, Breast Cancer Risk, and Breast Tissue Diagnosis.'
  },
  { 
    id: 'analysis',
    src: getAssetPath('/hygieia/Analysis-compressed.png'), 
    alt: 'Analysis Interface', 
    title: 'Analysis Interface',
    description: 'Intuitive analysis forms with dynamic, context-aware input fields, real-time validation, helper text for medical parameters, image upload capability, and progress indicators during processing.'
  },
  { 
    id: 'chat',
    src: getAssetPath('/hygieia/Chat-compressed.png'), 
    alt: 'Dr. Hygieia Chat', 
    title: 'AI Health Assistant - Dr. Hygieia',
    description: 'Context-aware AI assistant that knows your analysis history, supports multiple concurrent conversations with streaming responses, session management, and direct integration with specific analysis results.'
  },
  { 
    id: 'blockchain',
    src: getAssetPath('/hygieia/Block-compressed.png'), 
    alt: 'Blockchain Verification', 
    title: 'Blockchain Verification',
    description: 'Immutable record verification system with cryptographic hashing (SHA-256), complete audit trail, tamper detection, chain validation, and admin dashboard for complete oversight.'
  },
  { 
    id: 'auth',
    src: getAssetPath('/hygieia/RegLog-compressed.png'), 
    alt: 'Authentication', 
    title: 'User Authentication',
    description: 'Secure, elegant authentication experience with clean minimal design, form validation, JWT authentication, remember me option, password strength indicator, and professional healthcare imagery.'
  },
];

export default function HygieiaPage() {

  const [selectedImage, setSelectedImage] = useState<typeof screenshots[0] | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (modelName: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(modelName)) {
      newExpanded.delete(modelName);
    } else {
      newExpanded.add(modelName);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen">
      <SettingsPanel />
      {/* Mesh gradient background */}
      <div className="mesh-gradient" />
      
      {/* Back to Portfolio */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 z-40"
      >
        <Link 
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium hover:bg-accent/20 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 pointer-events-none" />

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Image
              src={getAssetPath('/hygieia/logo.svg')}
              alt="Hygieia Logo"
              width={300}
              height={300}
              className="mx-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Healthcare</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6"
          >
            <span className="text-gradient">HYGIEIA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-4"
          >
            AI-Powered Medical Diagnostic Platform
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8"
          >
            Revolutionizing Healthcare Through Intelligent Technology
          </motion.p>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12"
          >
            <span className="px-3 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
              96%+ Average Accuracy
            </span>
            <span className="px-3 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
              5 AI Models
            </span>
            <span className="px-3 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
              Blockchain Verified
            </span>
            <span className="px-3 py-2 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium">
              Dr. Hygieia AI Assistant
            </span>
          </motion.div>

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border/50 shadow-2xl"
          >
            <Image
              src={getAssetPath('/hygieia/Cover-compressed.png')}
              alt="Hygieia Platform Cover"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-8 mb-8">
              AI Models <span className="text-gradient">Portfolio</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Five specialized machine learning models providing clinical-grade diagnostic predictions
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {models.map((model, index) => (
              <motion.div
                key={model.name}
                variants={fadeInUp}
                className="relative p-6 rounded-2xl glass-card overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                      <model.icon size={50} className={model.iconColor} />
                    </div>
                    <h3 className="text-xl font-semibold text-right flex-1">{model.name}</h3>
                  </div>
                  <div className="text-center mb-2">
                    <span className="text-3xl font-bold text-gradient">{model.accuracy}</span>
                    <span className="text-sm text-muted-foreground block">accuracy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.params}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Model Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            {/* Mobile Table with Dropdown */}
            <div className="md:hidden">
              <table className="w-full rounded-xl overflow-hidden glass-card">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Model</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Accuracy</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, index) => (
                    <>
                      <tr 
                        key={model.name} 
                        className="border-b border-border/50 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleRow(model.name)}
                      >
                        <td className="px-2 sm:px-4 py-4 flex items-center justify-center gap-2">
                          <model.icon size={16} className={model.iconColor} /> {model.name}
                        </td>
                        <td className={`px-4 sm:px-6 py-4 font-semibold text-center ${model.accuracyColor}`}>{model.accuracy}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform ${expandedRows.has(model.name) ? 'rotate-180' : ''}`}
                          />
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedRows.has(model.name) && (
                          <motion.tr 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="bg-muted/30"
                          >
                            <td colSpan={3} className="px-4 sm:px-6 py-4">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-muted-foreground">ROC-AUC:</span>
                                    <span className="ml-2">{model.rocAuc}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Samples:</span>
                                    <span className="ml-2">{model.samples}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Architecture:</span>
                                    <span className="ml-2">{model.architecture}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Desktop Table with All Columns */}
            <div className="hidden 2xl:block overflow-x-auto">
              <table className="w-full rounded-xl overflow-hidden glass-card">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Model</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Accuracy</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">ROC-AUC</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Samples</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Architecture</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, index) => (
                    <tr key={model.name} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="px-2 sm:px-4 py-4 flex items-center justify-center gap-2">
                        <model.icon size={16} className={model.iconColor} /> {model.name}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 font-semibold text-center ${model.accuracyColor}`}>{model.accuracy}</td>
                      <td className="px-4 sm:px-6 py-4 text-center">{model.rocAuc}</td>
                      <td className="px-4 sm:px-6 py-4 text-center">{model.samples}</td>
                      <td className="px-4 sm:px-6 py-4 text-center text-muted-foreground">{model.architecture}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progressive Table - Shows as many columns as space allows */}
            <div className="hidden md:block 2xl:hidden">
              <table className="w-full rounded-xl overflow-hidden glass-card">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Model</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold">Accuracy</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold hidden lg:table-cell">ROC-AUC</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold hidden xl:table-cell">Samples</th>
                    <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, index) => (
                    <>
                      <tr key={model.name} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="px-2 sm:px-4 py-4 flex items-center justify-center gap-2">
                          <model.icon size={16} className={model.iconColor} /> {model.name}
                        </td>
                        <td className={`px-4 sm:px-6 py-4 font-semibold text-center ${model.accuracyColor}`}>{model.accuracy}</td>
                        <td className="px-4 sm:px-6 py-4 text-center hidden lg:table-cell">{model.rocAuc}</td>
                        <td className="px-4 sm:px-6 py-4 text-center hidden xl:table-cell">{model.samples}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <button 
                            onClick={() => toggleRow(model.name)}
                            className="p-1 hover:bg-muted/50 rounded transition-colors"
                          >
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform ${expandedRows.has(model.name) ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </td>
                      </tr>
                      {/* Show dropdown for hidden columns */}
                      <AnimatePresence>
                        {expandedRows.has(model.name) && (
                          <motion.tr 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="bg-muted/30"
                          >
                            <td colSpan={5} className="px-4 sm:px-6 py-4">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div className="lg:hidden">
                                    <span className="font-medium text-muted-foreground">ROC-AUC:</span>
                                    <span className="ml-2">{model.rocAuc}</span>
                                  </div>
                                  <div className="xl:hidden">
                                    <span className="font-medium text-muted-foreground">Samples:</span>
                                    <span className="ml-2">{model.samples}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-medium text-muted-foreground">Architecture:</span>
                                    <span className="ml-2 text-muted-foreground">{model.architecture}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
              Interface <span className="text-gradient">Showcase</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A beautiful, professional interface designed for healthcare trust and accessibility
            </p>
          </motion.div>

          {/* Showcase: alternating left-right, bigger images, hover popup */}
          <div className="relative w-full mx-auto">
            <div className="space-y-20">
              {screenshots.map((screenshot, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <motion.div
                    key={screenshot.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                      {/* Image - On mobile always first, on desktop alternates */}
                      <div className={`relative order-1 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
                        {/* Bigger image container with zoom effect */}
                        <motion.div
                          className="relative overflow-hidden rounded-xl cursor-pointer group"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => setSelectedImage(screenshot)}
                        >
                          <div className="relative w-full h-[30vh] sm:h-[35vh] md:h-[40vh] lg:h-[50vh] rounded-xl overflow-hidden bg-muted/50">
                            <Image
                              src={screenshot.src}
                              alt={screenshot.alt}
                              fill
                              className="object-contain w-full h-full"
                            />
                          </div>

                        </motion.div>
                      </div>

                      {/* Content - On mobile always second, on desktop alternates */}
                      <div className={`order-2 ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
                        <h3 className="text-2xl md:text-3xl font-semibold mb-3">{screenshot.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{screenshot.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
              Technical <span className="text-gradient">Architecture</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies for performance, scalability, and security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Frontend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl glass-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Monitor size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Frontend</h3>
                  <p className="text-sm text-muted-foreground">Next.js 14</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {frontendTech.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Backend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl glass-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Server size={24} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Backend</h3>
                  <p className="text-sm text-muted-foreground">Flask</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {backendTech.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
              Security <span className="text-gradient">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Multi-layer security architecture ensuring data protection and integrity
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {securityLayers.map((layer, index) => (
              <motion.div
                key={layer.title}
                variants={fadeInUp}
                className="p-6 rounded-2xl glass-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Lock size={20} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">Layer {index + 1}: {layer.title}</h3>
                </div>
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skin Diagnosis Pipeline */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
              Skin Diagnosis <span className="text-gradient">Pipeline</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced AI image analysis powered by Google Derm Foundation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl glass-card"
          >
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Pipeline Steps */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">1</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold">Input Image</h4>
                    <p className="text-sm text-muted-foreground">Upload skin lesion image</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold flex-shrink-0">2</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold">Google Derm Foundation Model</h4>
                    <p className="text-sm text-muted-foreground">Pre-trained on clinical images</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">3</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold">Feature Extraction</h4>
                    <p className="text-sm text-muted-foreground">6,144-dim Embeddings + 80 Engineered Features</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold flex-shrink-0">4</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold">Voting Ensemble</h4>
                    <p className="text-sm text-muted-foreground">XGBoost + Random Forest + Gradient Boosting + Extra Trees</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-bold flex-shrink-0">5</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold">7-Class Output</h4>
                    <p className="text-sm text-muted-foreground">Skin condition classification with confidence</p>
                  </div>
                </div>
              </div>

              {/* Detectable Conditions */}
              <div className="flex-1 w-full">
                <h4 className="text-lg font-semibold mb-4">Detectable Conditions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Actinic Keratoses',
                    'Basal Cell Carcinoma ⚠️',
                    'Benign Keratosis',
                    'Dermatofibroma',
                    'Melanoma ⚠️',
                    'Melanocytic Nevus',
                    'Vascular Lesions'
                  ].map((condition, i) => (
                    <div key={condition} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-sm flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className={`text-sm ${condition.includes('⚠️') ? 'text-yellow-400' : ''}`}>{condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding border-t border-border">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src={getAssetPath('/hygieia/logo.svg')}
              alt="Hygieia Logo"
              width={200}
              height={200}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-display font-bold mb-2">HYGIEIA</h3>
            <p className="text-muted-foreground mb-6">
              Empowering Health Through Intelligent Technology
            </p>
            <div className="flex justify-center gap-3 mb-8">
              <span className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs">Made with ❤️</span>
              <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">Powered by AI</span>
              <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs">Healthcare First</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Hygieia. All rights reserved.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 mt-6 text-accent hover:text-accent-light transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Krishna Vijay G&apos;s Portfolio
            </Link>
          </motion.div>
        </div>
      </footer>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-5xl w-full cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-accent transition-colors z-10 bg-black/50 rounded-full p-2"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div className="relative w-full h-[80vh] rounded-xl overflow-hidden bg-muted/50">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    className="object-contain w-full h-full"
                    quality={100}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
