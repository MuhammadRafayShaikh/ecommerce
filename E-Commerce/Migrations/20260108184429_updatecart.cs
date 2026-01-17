using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace E_Commerce.Migrations
{
    /// <inheritdoc />
    public partial class updatecart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Carts");

            migrationBuilder.AddColumn<int>(
                name: "ProductColorId",
                table: "Carts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "Carts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "Carts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Carts_ProductColorId",
                table: "Carts",
                column: "ProductColorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_ProductColors_ProductColorId",
                table: "Carts",
                column: "ProductColorId",
                principalTable: "ProductColors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Carts_ProductColors_ProductColorId",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_Carts_ProductColorId",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "ProductColorId",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "Carts");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Carts",
                type: "datetime2",
                nullable: true);
        }
    }
}
