"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Users,
  Lock,
  Coins,
  Image as ImageIcon,
} from "lucide-react";
import Marquee from "./components/landingPage/Marquee";
import Link from "next/link";
import Image from "next/image";

const IconWrapper = ({ children }) => (
  <div className="bg-gradient-to-r from-[#29FF81] to-yellow-300 rounded-full p-3 max-w-max">
    {children}
  </div>
);

const ScrollReveal = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMilestone((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-black" />,
      title: "Secure Digital Agreements",
      description: "Cryptographically signed and verified blockchain-based contract agreements with multi-party consent mechanisms."
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-black" />,
      title: "Flexible Signing Workflows", 
      description: "Support for single-party and multi-party contract agreements, enabling complex approval processes with customizable signers."
    },
    {
      icon: <Zap className="w-8 h-8 text-black" />,
      title: "Immutable Transaction Records",
      description: "Every contract and signature is permanently recorded on the blockchain, providing transparent and tamper-proof audit trails."
    },
   
  ];
  
  // Update howHSWorks array
  const howHSWorks = [
    {
      title: "1. Request Creation",
      description: "Initiate a contract by defining signers, terms, and required confirmations."
    },
    {
      title: "2. Collaborative Signing",
      description: "Invite specified parties to review and cryptographically sign the document using their blockchain wallet."
    },
    {
      title: "3. Smart Contract Verification", 
      description: "Advanced smart contracts validate signatures, ensuring all parties' consent before finalizing the request."
    },
    {
      title: "4. On-Chain Execution",
      description: "Completed and signed documents are permanently recorded, creating an immutable proof of agreement."
    }
  ];
  
  // Update useCases array
  const useCases = [
    {
      title: "Enterprise Contract Management",
      description: "Streamline complex multi-party agreement processes with transparent, blockchain-verified signatures."
    },
    {
      title: "Freelance and Consulting Agreements", 
      description: "Create secure, verifiable contracts with clear terms and automated signature workflows."
    },
    {
      title: "Hackathon Prize Disbursements",
      description: "Enable hackathon winner payouts and prize disbursements."
    },
    {
      title: "Real Estate and Legal Documents",
      description: "Enable cross-party document signing with cryptographic security and instant verification."
    }
  ];
  
  // Update reasonToChooseHS array
  const reasonToChooseHS = [
    {
      icon: <Shield className="w-8 h-8 text-black" />,
      title: "Unparalleled Security",
      description: "Blockchain-backed signatures eliminate fraud and provide cryptographic proof of agreement."
    },
    {
      icon: <Users className="w-8 h-8 text-black" />,
      title: "Regulatory Compliance", 
      description: "Built-in features to support legal and regulatory requirements for digital signatures."
    },
    {
      icon: <Coins className="w-8 h-8 text-black" />,
      title: "User-Friendly Experience",
      description: "Intuitive interface that makes blockchain document signing accessible to everyone."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="relative z-10">
        <main>
          <ScrollReveal>
            <div className="relative min-h-screen overflow-hidden">
              <header className="sticky top-0 container mx-auto p-5 md:p-10 flex gap-2 justify-between items-center z-20">
                <Link
                  href="/"
                  className="bg-white text-gray-800 font-bold py-2 px-3 md:py-3 md:px-8 rounded-lg transition-all duration-300 flex items-center border-2 border-gray-200 hover:border-gray-300 shadow-lg"
                >
                  <div className="flex items-center">
                    <Image
                      width={35}
                      height={35}
                      src="/handshake.png"
                      className="logoImage w-[20px] md:w-full h-[20px] md:h-full"
                      alt=""
                    />
                    <span className="font-dmsans font-bold ml-2 text-[0.865rem] md:text-[1.2rem] ld:text-[1.2rem]">
                      Requestify
                    </span>
                  </div>
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-[#29FF81] text-[0.865rem] md:text-[1rem] text-black font-bold py-2 px-3 md:py-3 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  <ArrowRight className="w-5 h-5 text-black" />
                  <span className="ml-2">Launch App</span>
                </Link>
              </header>
              {/* Dot pattern background */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/img/dots.png"
                  alt="Background pattern"
                  layout="fill"
                  objectFit="cover"
                  quality={100}
                />
              </div>
              {/* Green blob */}
              <div className="absolute -right-20 top-0 z-0">
                <Image
                  src="/img/green_blob.png"
                  alt="Green blob"
                  width={1000}
                  height={1000}
                  objectFit="cover"
                />
              </div>
              <section className="container mt-10 space-y-10 mx-auto p-14 md:p-20 text-center z-20 relative">
                <motion.h2
                  className="text-4xl md:text-7xl font-bold mb-6 max-w-3xl text-left text-gray-900 bg-clip-text text-black z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                 Everything you need to agree
                </motion.h2>
                <motion.p
                  className="text-xl md:text-2xl mb-8 text-left text-gray-600 max-w-3xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                   Send, sign, manage and pay all your contracts for free powered by Request Network.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row justify-start items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Link
                    className="bg-[#29FF81] text-black font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
                    href="/dashboard"
                  >
                    <ArrowRight className="w-5 h-5 text-black" />
                    <span className="ml-2">Get Started</span>
                  </Link>
                </motion.div>
              </section>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <section
              id="features"
              className="features container mx-auto px-4 py-20"
            >
              <h3 className="text-4xl font-bold mb-12 text-center text-gray-900">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 1,
                      staggerChildren: 0.5,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <IconWrapper>{feature.icon}</IconWrapper>
                    <h4 className="text-2xl font-bold mb-2 mt-4 text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section
              id="how-it-works"
              className="how-it-works container mx-auto px-4 py-20 bg-black "
            >
              <h3 className="text-4xl font-bold mb-12 text-center text-[#29FF81]">
                How Requestify Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {howHSWorks.map((step, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#29FF81]"></div>
                    <h4 className="text-2xl font-bold mb-4 text-black">
                      {step.title}
                    </h4>
                    <p className="text-gray-600">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section
              id="benefits"
              className="benefits container mx-auto px-4 py-20"
            >
              <h3 className="text-4xl font-bold mb-12 text-center text-gray-900">
                Why Choose Requestify
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {reasonToChooseHS.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <IconWrapper>{benefit.icon}</IconWrapper>
                    <h4 className="text-2xl font-bold mb-2 mt-4 text-gray-900">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section
              id="use-cases"
              className="use-cases container mx-auto px-4 py-20  bg-black"
            >
              <h3 className="text-4xl font-bold mb-12 text-center text-[#29FF81]">
                Use Cases
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {useCases.map((useCase, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#29FF81]"></div>
                    <h4 className="text-2xl font-bold mb-4 text-black">
                      {useCase.title}
                    </h4>
                    <p className="text-gray-600">{useCase.description}</p>
                  </motion.div>
                ))}
              </div>
              <h3 className="text-2xl font-bold my-12 text-center text-[#29FF81]">
                & many more...
              </h3>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="cta container mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
              <h3 className="text-4xl font-bold mb-6 text-gray-900">
              Transform Your Contract Signing Process
              </h3>
              <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
              Join the future of secure, transparent, and efficient digital agreements. Experience blockchain-powered document signing that ensures trust, compliance, and simplicity.
              </p>
              <Link
                href="/dashboard"
                className="bg-[#29FF81] text-black font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5 text-black" />
                <span className="ml-2">Get Started Now</span>
              </Link>
            </section>
          </ScrollReveal>

          {/* <Marquee /> */}
        </main>

        <footer className="bg-black text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              {/* <h5 className="text-2xl font-bold mb-4">Requestify</h5> */}
              <Link
                href="/"
                className="mb-6 bg-white text-gray-800 font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center border-2 border-gray-200 hover:border-gray-300 shadow-lg"
              >
                <div className="flex items-center">
                  <Image
                    width={35}
                    height={35}
                    src="/handshake.png"
                    className="logoImage "
                    alt=""
                  />
                  <span className="logoText md:text-1rem ld:text-[1.2rem]">
                    Requestify
                  </span>
                </div>
              </Link>
              <p className="text-gray-400 text-center max-w-md">
              Revolutionizing digital agreements with Request Network payments. Secure, verifiable, and efficient contract management.
              </p>
              <div className="mt-8 text-sm text-gray-400">
                © 2024 Requestify. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
