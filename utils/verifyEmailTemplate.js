const VerifyEmailTemplate = (userName, otp) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Verify Your Email</title>
      </head>

      <body>
        <div class="container">

          <!-- Header -->
          <div class="header">
            <h1>My-Store</h1>
          </div>

          <!-- Content -->
          <div class="content">

            <h2>Hello ${userName},</h2>

            <p>
              Thank you for registering with My-Store.
            </p>

            <p>
              Please use the OTP below to verify your email address:
            </p>

            <h1>${otp}</h1>

            <p>
              This OTP is valid for 10 minutes.
            </p>

            <p>
              If you did not create this account, please ignore this email.
            </p>

            <p>
              Thanks,<br />
              My-Store Team
            </p>

          </div>

        </div>
      </body>
    </html>
  `;
};

export default VerifyEmailTemplate;
