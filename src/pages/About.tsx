import { Users, Target, Heart, Award, Mail, Phone, MapPin } from 'lucide-react';

export default function About() {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & Editor-in-Chief',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      bio: 'Passionate about storytelling and connecting people through meaningful content.'
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      bio: 'Building the technical foundation that powers our community of writers.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Strategist',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      bio: 'Helping writers craft compelling stories that resonate with our audience.'
    },
    {
      name: 'David Kim',
      role: 'Community Manager',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      bio: 'Fostering connections and building relationships within our writing community.'
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'Passion for Stories',
      description: 'We believe every person has a unique story worth telling and sharing with the world.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'Community First',
      description: 'Building a supportive community where writers can grow, learn, and inspire each other.'
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: 'Quality Content',
      description: 'Committed to maintaining high standards and delivering valuable content to our readers.'
    },
    {
      icon: <Award className="w-8 h-8 text-purple-500" />,
      title: 'Excellence',
      description: 'Striving for excellence in everything we do, from writing to user experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              About <span className="text-yellow-300">QuestMeraki</span>
            </h1>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Where passion meets storytelling. We're a community-driven platform dedicated to
              empowering writers and connecting readers with extraordinary stories.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-80">Stories Published</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">5K+</div>
                <div className="text-sm opacity-80">Active Writers</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm opacity-80">Monthly Readers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-xl text-gray-600">
                How QuestMeraki came to life
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12">
                <p className="text-gray-700 mb-6 leading-relaxed text-justify">
                  QuestMeraki is from the heart and mind. It is a droplet in the ocean of knowledge, facts, perceptions, attitudes, emotions and aspirations. It deals with the known and the expected, believed and the wished, wisdom and the sensations, petite and exciting things in life. It is all about people, workplace, education, family and God.

                  The name says it all!
                  Indeed, QuestMeraki is an initiative that I wish to do wholeheartedly and with a deep sense of commitment. It is a combination of two powerful words ‘Quest’ + ‘Meraki’.

                  Quest -  (v) to search for something; to pursue

                  Meraki – a Greek word which means – (v) to do something with passion or love, with devotion; to put your soul into something that you are doing.


                </p>

                <p className="text-gray-700 mb-6 leading-relaxed text-justify ">
                  Yes, the purpose of this blog is to look at different topics from a new perspective; to search for facts and findings; to add to existing ‘knowledge’ content and present it to my readers for their benefit.  Hand over my heart, I wish to do all these and much more with great passion and love; love for search of knowledge; love to share...

                  Get introduced to QuestMeraki

                  Perspective is a place for sharing author's opinions and understanding of various matters; be it academic substance, research, management issues, work life, everyday concerns or life's challenges.

                  Testimonies, God's immense grace and His Divine words are featured in the "Palms of His Hands".

                  Research is both a passion and an intellectual demand for many people. If you are one such person, click on "Questionnaires - Samples" to view some sample questionnaires for undertaking surveys/research on different topics. These will be merely prompters which will help you build a more extensive questionnaire.

                  Ideating Zone is where you get access to training packs on various topics, exercises, task sheets and self-evaluation tools that may be useful for personal or professional purposes.


                </p>

                <p className="text-gray-700 mb-6 leading-relaxed text-justify" >
                  I believe...

                  There is always room for spice and fun in learning and living!

                  There is always a space in our heart for new hope and new beginnings...

                  I sincerely hope that you will find this blog useful as you journey in search of information.

                  A few words about myself....

                  I have been a teacher most of my adult life. I spent the last 18 years in higher educational institutions, teaching diversified students in India, Dubai and Oman. Previous to this, I worked at a Social Work Organisation, which gave me strong foundation for research. I hold a Ph.D,  a Masters in Social Work and a Masters in Business Administration. My specialisation is Human Resource Management (MSW) and Education Management (MBA). Presently, I live in Bahrain with my delightful family.

                  I enjoy meeting and facilitating learning among students. Research has always been my passion and I enjoy preparing questionnaires, reviewing literature, analysing data and writing reports. It is this passion which motivated me to start this blog. I wanted to share my interests with the world at large. I wish that you will benefit at least in a small way by visiting my blog. :-)

                  Be God's and Be Good

                </p>

                <p className="text-base text-gray-700 text-right">
                  <span className="font-semibold text-gray-800">Author:</span> Anthea Washington
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-xl text-gray-600">
                Democratizing storytelling and creating a space where every voice matters
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Empowering Every Writer
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    At QuestMeraki, we believe that everyone has a story to tell. Our platform
                    provides the tools, community, and support needed to transform ideas into
                    compelling narratives that inspire and connect people across the globe.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Whether you're a seasoned author or just starting your writing journey,
                    we're here to help you find your voice and share it with the world.
                  </p>
                </div>
                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg"
                    alt="Writing and creativity"
                    className="rounded-lg shadow-lg w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">
                The passionate people behind QuestMeraki
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}



      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Share Your Story?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of passionate writers and start your storytelling journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Start Writing
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors duration-200"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}