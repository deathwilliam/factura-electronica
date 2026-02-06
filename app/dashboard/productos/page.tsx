import { Button } from "@/components/ui/Button";
import { getProducts, getProductCategories } from "@/actions/products";
import Link from "next/link";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; type?: string; search?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { products, totalPages } = await getProducts({
        page,
        type: params.type,
        search: params.search,
        active: true,
    });
    const categories = await getProductCategories();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Productos y Servicios</h2>
                    <p className="text-muted-foreground">Catálogo de productos y servicios.</p>
                </div>
                <Link href="/dashboard/productos/new">
                    <Button>+ Nuevo Producto</Button>
                </Link>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 items-center">
                <form className="flex gap-2 flex-1">
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar por nombre o código..."
                        defaultValue={params.search}
                        className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                    <select
                        name="type"
                        defaultValue={params.type}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="PRODUCT">Productos</option>
                        <option value="SERVICE">Servicios</option>
                    </select>
                    <Button type="submit">Filtrar</Button>
                </form>
            </div>

            {products.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
                    No hay productos registrados. Crea uno para comenzar.
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Precio</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">IVA</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono text-sm">{product.code}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                {product.description && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                product.type === "SERVICE"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}>
                                                {product.type === "SERVICE" ? "Servicio" : "Producto"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {product.category?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ${product.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {product.taxable ? (
                                                <span className="text-green-600">Sí</span>
                                            ) : (
                                                <span className="text-gray-400">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/dashboard/productos/${product.id}`}
                                                className="text-primary hover:underline text-sm"
                                            >
                                                Editar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Link
                                    key={p}
                                    href={`/dashboard/productos?page=${p}${params.type ? `&type=${params.type}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                                    className={`px-3 py-1 rounded ${
                                        p === page
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    }`}
                                >
                                    {p}
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Categorías */}
            {categories.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">Categorías</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <span
                                key={cat.id}
                                className="px-3 py-1 bg-muted rounded-full text-sm"
                            >
                                {cat.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
