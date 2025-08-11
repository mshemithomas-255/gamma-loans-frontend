import { motion } from "framer-motion";
import Footer from "../components/Footer";

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen flex flex-col items-center justify-center text-white"
    >
      {/* Hero Section */}
      <div
        className="w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        <div className="text-center bg-black bg-opacity-50 p-8 rounded-lg">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl font-bold mb-4"
          >
            About Gammaridge
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl mb-8"
          >
            Empowering lives through loans, clothing, and farm produce.
          </motion.p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >
            Our Mission
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-700 text-center max-w-2xl mx-auto"
          >
            At Gammaridge, we are committed to providing innovative solutions
            that improve the quality of life for our customers. Whether it's
            through affordable loans, stylish clothing, or fresh farm produce,
            we strive to make a positive impact in every community we serve.
          </motion.p>
        </div>
      </div>

      {/* Services Section */}
      <div className="w-full bg-gray-100 py-16">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {/* Loans Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200"
          >
            <div
              className="h-48 bg-cover bg-center rounded-t-lg mb-4"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              }}
            ></div>
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Loans</h3>
            <p className="text-gray-700 mb-4">
              Quick and easy loans to meet your financial needs. We offer
              flexible repayment plans and competitive interest rates.
            </p>
          </motion.div>

          {/* Clothing Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200"
          >
            <div
              className="h-48 bg-cover bg-center rounded-t-lg mb-4"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              }}
            ></div>
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Clothing</h3>
            <p className="text-gray-700 mb-4">
              Stylish and affordable clothing for everyone. From casual wear to
              formal attire, we’ve got you covered.
            </p>
          </motion.div>

          {/* Farm Produce Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200"
          >
            <div
              className="h-48 bg-cover bg-center rounded-t-lg mb-4"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              }}
            ></div>
            <h3 className="text-2xl font-bold text-blue-600 mb-4">
              Farm Produce
            </h3>
            <p className="text-gray-700 mb-4">
              Fresh and organic farm produce delivered to your doorstep. We
              source directly from local farmers to ensure quality.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="w-full bg-white py-16">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {/* Integrity Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Integrity</h3>
            <p className="text-gray-700 mb-4">
              We believe in honesty and transparency in all our dealings.
            </p>
          </motion.div>

          {/* Innovation Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-blue-600 mb-4">
              Innovation
            </h3>
            <p className="text-gray-700 mb-4">
              We constantly seek new ways to improve and serve our customers
              better.
            </p>
          </motion.div>

          {/* Community Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Community</h3>
            <p className="text-gray-700 mb-4">
              We are dedicated to making a positive impact in the communities we
              serve.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full">
        <Footer />
      </div>
    </motion.div>
  );
};

export default About;
