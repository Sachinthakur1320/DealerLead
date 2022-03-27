using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OneEightyDataAccess.DataAccess;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Implementation;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Utils;

namespace OneEightyDataAccess
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApiVersioning(o => o.ReportApiVersions = true);
            services.AddControllers();
            services.AddHttpClient();

            services.AddAutoMapper(typeof(DataMapperProfile));
            services.AddTransient<IAppointmentsFactory, AppointmentsFactory>();
            services.AddTransient<IAppointmentsDataRepository, AppointmentsDataRepository>();
            services.AddTransient<IUsersAccountFactory, UsersAccountFactory>();
            services.AddTransient<IUsersAccountDataRepository, UsersAccountDataRepository>();
            services.AddTransient<IDealerFactory, DealerFactory>();
            services.AddTransient<IDataConnection, DataConnection>();
            services.AddTransient<IDealerDataRepository, DealerDataRepository>();
            services.AddTransient<IGetConfiguration,GetConfiguration>();
            services.AddTransient<IDataStrategy, DataStrategy>();
            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app,IWebHostEnvironment env)
        {
            if(env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
