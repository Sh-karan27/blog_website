import React from "react";

const HomeContent = () => {
  return (
    <div className=" font-display bg-white">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <section className="relative h-[500px] rounded-xl bg-cover bg-center text-white">
          <div className="absolute inset-0 rounded-xl bg-black/50"></div>
          <div
            className="absolute inset-0 bg-cover bg-center rounded-xl"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBaRAEqRyNElOTYhweta4spMmswZRCqYXimDDqb63u8uUlrx8cRMemmtkKkAUyXyuJs8w2Bo1GXDHnF5TjWn_Kyt-OwU1x2C8rnxpAeHGD4rnbVc_1VPBeb35wMESf2LNDvF_EFg215uGIac3E0YdSPi4N3jVI4cunjops9a3fYIgEFdsSWor2ey0SrA8SZOODrWGZgZH3hRJGp0LTX2E5khSIIKpXCpxS-ndoXY9SuYVhdX_ANkFrGccEVEbsnP3D3zxsExC9Cp5I")',
            }}
          ></div>
          <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 md:p-12">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Stay Ahead in the Tech World
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-200">
              Get the latest insights, trends, and analysis on technology,
              innovation, and digital transformation.
            </p>
            <button className="mt-8 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-hover">
              Explore Articles
            </button>
          </div>
        </section>

        {/* Recent Posts Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Recent Posts
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {[
              {
                title: "The Future of AI in Business",
                desc: "Explore how artificial intelligence is reshaping industries and driving innovation.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuACap31xx88JE6Tzueglp4tFiFKzUgpQBUCqb0WGJf3KfJkXd4Wxk9G9z5jWLmgXQam4IRNWXsEPUsFmrPO48StCL1OpM0Tml16C9iMa9uod2UTA3FOkAPJEoZukm9lK-EDtqUdaad5n9_0irPwDHM22S-rVyUYxB7l6pdhFKn5mdcxCySdD5bLwVbR5rHuQ0bjnivsuDbGoN22QtRchBHug_6HeIXSsW7hYr4AiSF8eylmy4sIq-V9udnHC2BkSKtumzcmQiNUAzw",
              },
              {
                title: "Cybersecurity Trends to Watch in 2024",
                desc: "Stay informed about the latest threats and best practices to protect your digital assets.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPCZf5WVBgE0JLJamifQBNp0NHCelgD4UcbTgNc5fijxyDLIYWlGtz2XTeJxp3A4nVx0Z30lPNplxWIhpt_Sf0Ybhx0OiDo243JKJjyD5WPP87SMX5Dis9AfpX-Ddx8kIsfvPRZQuHJiXMYybh5kweOo_KSnz80vDcEtGqG91WpeTElpSVM3ziwNFCkxmHWP-_dBLa6-YudoMH4dCfoNeacPoQRU-40x-PcmQdmpPdYdU2zyzkPJiln4sujZ_b7BEsbMge-8kSgIE",
              },
              {
                title: "The Rise of Remote Work Technologies",
                desc: "Discover the tools and strategies that are enabling seamless remote collaboration.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOlwBrZGuv7kX0ABqdTXgdIutz1F612D84H4iJnI2rnLTYeBC03jQadP8GI0r7PHCPuBlfWPp0u-VTmzVvKQadH7CXsvCS1mz7ldJz-icO-ZJYD3LFTfxhPfWIR1RrRI9utDEkS71mEo2AsRxa41mGUBHYdSwxLIqfWd7AL-W6nVhHawVW_f6OnbAJNiG3bnJS61RQQQwXKaYqu2BB40UQi9fMy-cwBB00fwzS6Qjc-1v5KepuxdDvL2Pl4ryudFdjZqCm4tj3WUk",
              },
            ].map((post, i) => (
              <article
                key={i}
                className="flex flex-col items-start justify-between"
              >
                <div className="relative w-full">
                  <div
                    className="aspect-[16/9] w-full rounded-lg bg-cover bg-center sm:aspect-[2/1] lg:aspect-[3/2]"
                    style={{ backgroundImage: `url("${post.img}")` }}
                  ></div>
                  <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                </div>

                <div className="max-w-xl">
                  <div className="group relative mt-4">
                    <h3 className="text-lg font-semibold leading-6 text-text-light dark:text-white group-hover:text-primary-hover dark:group-hover:text-primary">
                      <a href="#">
                        <span className="absolute inset-0"></span>
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {post.desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="rounded-lg bg-accent-light dark:bg-accent-dark px-6 py-3 text-sm font-semibold text-text-light dark:text-text-dark shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600">
              View All Articles
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeContent;
