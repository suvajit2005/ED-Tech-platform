import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-8">
            Contact Us
          </h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Get in Touch
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                Have questions or need support? We're here to help!
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Email</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">support@edtechplatform.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Phone</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Address</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    123 Education Street<br />
                    Learning City, LC 12345
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Send us a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input type="text" className="input" placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input" rows="4" placeholder="Your message"></textarea>
                </div>
                <button type="submit" className="btn-primary btn-md w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
